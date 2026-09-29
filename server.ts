import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_CANDIDATES,
  INITIAL_EVALUATIONS,
  DEFAULT_AMCAT_CATEGORIES,
} from './src/data/sampleData.ts';
import { Candidate, EvaluationRecord, AmcatCategory } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Shared Server Store (persists across all users & tabs)
let sharedCandidates: Candidate[] = [...INITIAL_CANDIDATES];
let sharedEvaluations: EvaluationRecord[] = [...INITIAL_EVALUATIONS];
let sharedAmcatCategories: AmcatCategory[] = [...DEFAULT_AMCAT_CATEGORIES];
let sharedInterviewers: string[] = [
  'Dr. Rajesh Sharma (Nexora Tech Lead)',
  'Priya Patel (InsightEdge Analytics)',
  'Amit Verma (CloudVantage Tech Sales)',
  'Dr. Sunita Rao (HR & Corporate Panel)',
  'Sneha Kulkarni (Engineering Lead)',
  'Vikram Mehta (Placement Coordinator)',
];

// Active SSE client connections
const clients: Response[] = [];

function broadcast(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (let i = clients.length - 1; i >= 0; i--) {
    try {
      clients[i].write(payload);
    } catch (err) {
      clients.splice(i, 1);
    }
  }
}

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // 1. SSE Real-Time Stream Endpoint
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send initial snapshot
    res.write(
      `event: init\ndata: ${JSON.stringify({
        candidates: sharedCandidates,
        evaluations: sharedEvaluations,
        amcatCategories: sharedAmcatCategories,
        interviewers: sharedInterviewers,
      })}\n\n`
    );

    clients.push(res);
    broadcast('presence', { connectedUsers: clients.length });

    req.on('close', () => {
      const idx = clients.indexOf(res);
      if (idx !== -1) clients.splice(idx, 1);
      broadcast('presence', { connectedUsers: clients.length });
    });
  });

  // 2. State Snapshot Endpoint
  app.get('/api/state', (req: Request, res: Response) => {
    res.json({
      candidates: sharedCandidates,
      evaluations: sharedEvaluations,
      amcatCategories: sharedAmcatCategories,
      interviewers: sharedInterviewers,
      connectedUsers: Math.max(1, clients.length),
    });
  });

  // 3. Evaluations Endpoints
  app.post('/api/evaluations', (req: Request, res: Response) => {
    const record: EvaluationRecord = req.body;
    if (!record || !record.id) {
      return res.status(400).json({ error: 'Invalid evaluation data' });
    }

    sharedEvaluations = [record, ...sharedEvaluations.filter((e) => e.id !== record.id)];

    // Update candidate status
    const cand = sharedCandidates.find(
      (c) => c.id === record.candidateId || c.rollNo.toLowerCase() === record.rollNo.toLowerCase()
    );
    if (cand) {
      if (record.evaluationType === 'GD') {
        cand.status = record.totalScore >= 25 ? 'PI Shortlisted' : 'Eliminated';
      } else {
        cand.status = 'Selected';
      }
    }

    broadcast('state_updated', {
      evaluations: sharedEvaluations,
      candidates: sharedCandidates,
    });

    res.json({ success: true, record });
  });

  app.delete('/api/evaluations/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    sharedEvaluations = sharedEvaluations.filter((e) => e.id !== id);
    broadcast('state_updated', { evaluations: sharedEvaluations });
    res.json({ success: true });
  });

  // 4. Candidate Endpoints
  app.post('/api/candidates', (req: Request, res: Response) => {
    const candidate: Candidate = req.body;
    if (!candidate || !candidate.name) {
      return res.status(400).json({ error: 'Invalid candidate data' });
    }
    sharedCandidates = [candidate, ...sharedCandidates];
    broadcast('state_updated', { candidates: sharedCandidates });
    res.json({ success: true, candidate });
  });

  app.post('/api/candidates/bulk', (req: Request, res: Response) => {
    const newCandidates: Candidate[] = req.body.candidates || [];
    sharedCandidates = [...newCandidates, ...sharedCandidates];
    broadcast('state_updated', { candidates: sharedCandidates });
    res.json({ success: true, count: newCandidates.length });
  });

  app.delete('/api/candidates/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    sharedCandidates = sharedCandidates.filter((c) => c.id !== id);
    broadcast('state_updated', { candidates: sharedCandidates });
    res.json({ success: true });
  });

  app.post('/api/candidates/reset', (req: Request, res: Response) => {
    sharedCandidates = [...INITIAL_CANDIDATES];
    broadcast('state_updated', { candidates: sharedCandidates });
    res.json({ success: true });
  });

  app.put('/api/candidates/:id/amcat', (req: Request, res: Response) => {
    const { id } = req.params;
    const { scores, total } = req.body;
    const cand = sharedCandidates.find((c) => c.id === id);
    if (cand) {
      cand.amcatScores = scores;
      cand.amcatScore = total;
      broadcast('state_updated', { candidates: sharedCandidates });
      return res.json({ success: true, candidate: cand });
    }
    res.status(404).json({ error: 'Candidate not found' });
  });

  // 5. AMCAT Category Management Endpoint
  app.put('/api/amcat-categories', (req: Request, res: Response) => {
    const categories: AmcatCategory[] = req.body.categories;
    if (Array.isArray(categories)) {
      sharedAmcatCategories = categories;
      broadcast('state_updated', { amcatCategories: sharedAmcatCategories });
      return res.json({ success: true, categories: sharedAmcatCategories });
    }
    res.status(400).json({ error: 'Invalid categories' });
  });

  // 6. Interviewers Management Endpoint
  app.post('/api/interviewers', (req: Request, res: Response) => {
    const { name } = req.body;
    if (name && typeof name === 'string' && !sharedInterviewers.includes(name.trim())) {
      sharedInterviewers = [...sharedInterviewers, name.trim()];
      broadcast('state_updated', { interviewers: sharedInterviewers });
      return res.json({ success: true, interviewers: sharedInterviewers });
    }
    res.json({ success: true, interviewers: sharedInterviewers });
  });

  // 7. Mount Vite in Development or Serve Static in Production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = process.env.PORT || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening dynamically on port ${port}`);
  });
}

startServer();
