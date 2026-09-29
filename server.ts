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
import { DEFAULT_USERS } from './src/data/defaultUsers.ts';
import { Candidate, EvaluationRecord, AmcatCategory, AppUser } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Shared Server Store (persists across all users & tabs)
let sharedCandidates: Candidate[] = [...INITIAL_CANDIDATES];
let sharedEvaluations: EvaluationRecord[] = [...INITIAL_EVALUATIONS];
let sharedAmcatCategories: AmcatCategory[] = [...DEFAULT_AMCAT_CATEGORIES];
let sharedUsers: AppUser[] = [...DEFAULT_USERS];
let sharedInterviewers: string[] = DEFAULT_USERS.map((u) => u.name);
let masterSheetConfig: {
  webhookUrl?: string;
  spreadsheetId?: string;
  ownerEmail?: string;
  lastSyncedAt?: string;
  syncCount?: number;
} = {
  ownerEmail: 'jitsahere@gmail.com',
  syncCount: 0,
};

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
        users: sharedUsers,
        masterSheetConfig,
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
      users: sharedUsers,
      masterSheetConfig,
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

    // Auto-forward to Universal Master Google Sheet if configured
    if (masterSheetConfig.webhookUrl) {
      fetch(masterSheetConfig.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'append_evaluation',
          srNo: record.srNo,
          timestamp: record.timestamp,
          rollNo: record.rollNo,
          studentName: record.studentName,
          degree: record.degree,
          targetRole: record.targetRole,
          evaluationType: record.evaluationType,
          totalScore: record.totalScore,
          verdict: record.automatedReview?.verdict || 'Evaluated',
          interviewerName: record.interviewerName,
          customFeedback: record.customFeedback || record.interviewerRemarks || '',
          aiFeedback: record.aiFeedback || '',
        }),
      })
        .then(() => {
          masterSheetConfig.syncCount = (masterSheetConfig.syncCount || 0) + 1;
          masterSheetConfig.lastSyncedAt = new Date().toLocaleTimeString();
        })
        .catch((err) => {
          console.log('Error forwarding to master Google Sheet webhook:', err.message);
        });
    }

    broadcast('state_updated', {
      evaluations: sharedEvaluations,
      candidates: sharedCandidates,
      masterSheetConfig,
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

  // 6. User Credentials Management Endpoint
  app.get('/api/users', (req: Request, res: Response) => {
    res.json({ users: sharedUsers });
  });

  app.post('/api/users', (req: Request, res: Response) => {
    const user: AppUser = req.body;
    if (!user || !user.username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const existingIndex = sharedUsers.findIndex(
      (u) => u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase()
    );

    if (existingIndex !== -1) {
      sharedUsers[existingIndex] = { ...sharedUsers[existingIndex], ...user };
    } else {
      const newUser: AppUser = {
        ...user,
        id: user.id || `user-${Date.now()}`,
      };
      sharedUsers.push(newUser);
    }

    sharedInterviewers = sharedUsers.map((u) => u.name);

    broadcast('state_updated', {
      users: sharedUsers,
      interviewers: sharedInterviewers,
    });

    res.json({ success: true, users: sharedUsers });
  });

  app.delete('/api/users/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    sharedUsers = sharedUsers.filter((u) => u.id !== id);
    sharedInterviewers = sharedUsers.map((u) => u.name);

    broadcast('state_updated', {
      users: sharedUsers,
      interviewers: sharedInterviewers,
    });

    res.json({ success: true, users: sharedUsers });
  });

  app.post('/api/users/reset', (req: Request, res: Response) => {
    sharedUsers = [...DEFAULT_USERS];
    sharedInterviewers = DEFAULT_USERS.map((u) => u.name);

    broadcast('state_updated', {
      users: sharedUsers,
      interviewers: sharedInterviewers,
    });

    res.json({ success: true, users: sharedUsers });
  });

  // 7. Interviewers Management Endpoint
  app.post('/api/interviewers', (req: Request, res: Response) => {
    const { name } = req.body;
    if (name && typeof name === 'string' && !sharedInterviewers.includes(name.trim())) {
      sharedInterviewers = [...sharedInterviewers, name.trim()];
      broadcast('state_updated', { interviewers: sharedInterviewers });
      return res.json({ success: true, interviewers: sharedInterviewers });
    }
    res.json({ success: true, interviewers: sharedInterviewers });
  });

  // 8. Universal Master Google Sheet Endpoints
  app.get('/api/master-sheet', (req: Request, res: Response) => {
    res.json(masterSheetConfig);
  });

  app.post('/api/master-sheet', (req: Request, res: Response) => {
    const { webhookUrl, spreadsheetId, ownerEmail } = req.body;
    masterSheetConfig = {
      ...masterSheetConfig,
      webhookUrl: webhookUrl !== undefined ? String(webhookUrl).trim() : masterSheetConfig.webhookUrl,
      spreadsheetId: spreadsheetId !== undefined ? String(spreadsheetId).trim() : masterSheetConfig.spreadsheetId,
      ownerEmail: ownerEmail || masterSheetConfig.ownerEmail,
      lastSyncedAt: new Date().toLocaleTimeString(),
    };
    broadcast('state_updated', { masterSheetConfig });
    res.json({ success: true, masterSheetConfig });
  });

  app.post('/api/master-sheet/sync-all', async (req: Request, res: Response) => {
    if (!masterSheetConfig.webhookUrl) {
      return res.status(400).json({ error: 'No master sheet webhook configured' });
    }

    try {
      const rows = sharedEvaluations.map((e) => [
        e.srNo,
        e.timestamp,
        e.rollNo,
        e.studentName,
        e.degree,
        e.targetRole,
        e.evaluationType === 'GD' ? 'Group Discussion (50M)' : 'Personal Interview (50M)',
        `${e.totalScore}/50`,
        e.automatedReview?.verdict || 'Evaluated',
        e.interviewerName,
        e.customFeedback || e.interviewerRemarks || '',
        e.aiFeedback || '',
      ]);

      const headers = [
        'Sr No',
        'Timestamp',
        'Roll No',
        'Student Name',
        'Degree',
        'Target Role',
        'Round',
        'Total Score',
        'Verdict',
        'Evaluator',
        'Remarks',
        'AI Feedback',
      ];

      await fetch(masterSheetConfig.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clear_and_sync',
          headers,
          rows,
        }),
      });

      masterSheetConfig.lastSyncedAt = new Date().toLocaleTimeString();
      masterSheetConfig.syncCount = sharedEvaluations.length;
      broadcast('state_updated', { masterSheetConfig });
      res.json({ success: true, count: rows.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to sync with master sheet webhook' });
    }
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
