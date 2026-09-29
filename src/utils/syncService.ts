import { Candidate, EvaluationRecord, AmcatCategory } from '../types';

export interface SharedAppState {
  candidates?: Candidate[];
  evaluations?: EvaluationRecord[];
  amcatCategories?: AmcatCategory[];
  interviewers?: string[];
  connectedUsers?: number;
}

type SyncCallback = (delta: SharedAppState) => void;

class SyncService {
  private listeners: SyncCallback[] = [];
  private broadcastChannel: BroadcastChannel | null = null;
  private eventSource: EventSource | null = null;

  constructor() {
    // 1. Initialize BroadcastChannel for instant local inter-tab synchronization
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('mock_placement_drive_sync');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data) {
          this.notifyListeners(event.data);
        }
      };
    }

    // 2. Initialize Server-Sent Events (SSE) for cross-user network synchronization
    this.connectSSE();
  }

  private connectSSE() {
    if (typeof window === 'undefined') return;

    try {
      this.eventSource = new EventSource('/api/events');

      this.eventSource.addEventListener('init', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          this.notifyListeners(data);
        } catch (err) {
          console.error('Failed to parse SSE init:', err);
        }
      });

      this.eventSource.addEventListener('state_updated', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          this.notifyListeners(data);
        } catch (err) {
          console.error('Failed to parse SSE state_updated:', err);
        }
      });

      this.eventSource.addEventListener('presence', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          this.notifyListeners(data);
        } catch (err) {
          console.error('Failed to parse SSE presence:', err);
        }
      });

      this.eventSource.onerror = () => {
        // SSE handles reconnection automatically
      };
    } catch (err) {
      console.warn('SSE not supported or server unavailable:', err);
    }
  }

  public subscribe(callback: SyncCallback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(delta: SharedAppState) {
    this.listeners.forEach((cb) => cb(delta));
  }

  private broadcastLocal(delta: SharedAppState) {
    this.notifyListeners(delta);
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(delta);
    }
  }

  // --- API Mutators (Optimistic + Server Broadcast) ---

  public async saveEvaluation(record: EvaluationRecord) {
    this.broadcastLocal({
      evaluations: [record], // handled idempotently
    });

    try {
      await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    } catch (err) {
      console.error('Error posting evaluation to server:', err);
    }
  }

  public async deleteEvaluation(id: string) {
    try {
      await fetch(`/api/evaluations/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting evaluation:', err);
    }
  }

  public async saveCandidate(candidate: Candidate) {
    this.broadcastLocal({
      candidates: [candidate],
    });

    try {
      await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidate),
      });
    } catch (err) {
      console.error('Error posting candidate to server:', err);
    }
  }

  public async bulkAddCandidates(candidates: Candidate[]) {
    try {
      await fetch('/api/candidates/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidates }),
      });
    } catch (err) {
      console.error('Error bulk uploading candidates:', err);
    }
  }

  public async deleteCandidate(id: string) {
    try {
      await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting candidate:', err);
    }
  }

  public async resetCandidates() {
    try {
      await fetch('/api/candidates/reset', { method: 'POST' });
    } catch (err) {
      console.error('Error resetting candidates:', err);
    }
  }

  public async updateCandidateAmcat(id: string, scores: Record<string, number>, total: number) {
    try {
      await fetch(`/api/candidates/${id}/amcat`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores, total }),
      });
    } catch (err) {
      console.error('Error updating candidate AMCAT:', err);
    }
  }

  public async updateAmcatCategories(categories: AmcatCategory[]) {
    this.broadcastLocal({ amcatCategories: categories });
    try {
      await fetch('/api/amcat-categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories }),
      });
    } catch (err) {
      console.error('Error updating AMCAT categories:', err);
    }
  }

  public async addInterviewer(name: string) {
    try {
      await fetch('/api/interviewers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
    } catch (err) {
      console.error('Error saving interviewer:', err);
    }
  }
}

export const syncService = new SyncService();
