import { create } from 'zustand';
import { api } from '../lib/api';

export interface MoodEntry {
  id: string;
  score: number;
  emotions: string[];
  note: string | null;
  loggedAt: string;
  createdAt: string;
}

interface MoodState {
  entries: MoodEntry[];
  loading: boolean;
  load: () => Promise<void>;
  log: (score: number, emotions: string[], note?: string) => Promise<void>;
}

export const useMoodStore = create<MoodState>((set, get) => ({
  entries: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/api/mood?days=30');
      set({ entries: data });
    } catch {
    } finally {
      set({ loading: false });
    }
  },

  log: async (score, emotions, note) => {
    await api.post('/api/mood', {
      score,
      emotions,
      note,
      logged_at: new Date().toISOString(),
    });
    await get().load();
  },
}));
