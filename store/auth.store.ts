import { create } from 'zustand';
import { api } from '../lib/api';
import { getItem, setItem, deleteItem } from '../lib/storage';

interface User {
  id: string;
  email: string;
  name: string;
  onboardingCompleted: boolean;
  dailyMsgCount: number;
}

interface Plan {
  id: string;
  limits: {
    messagesPerDay: number | null;
    conversationsMax: number | null;
    moodAnalysis: boolean;
    voiceInput: boolean;
    model: string;
  };
}

interface AuthState {
  user: User | null;
  plan: Plan | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loadMe: () => Promise<void>;
  isPremium: () => boolean;
  canSendMessage: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  plan: null,
  token: null,
  loading: true,

  login: async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    await setItem('jwt', data.token);
    set({ token: data.token });
    await get().loadMe();
  },

  register: async (email, password, name) => {
    const { data } = await api.post('/api/auth/register', { email, password, name });
    await setItem('jwt', data.token);
    set({ token: data.token });
    await get().loadMe();
  },

  logout: async () => {
    await deleteItem('jwt');
    set({ user: null, plan: null, token: null });
  },

  loadMe: async () => {
    try {
      const token = await getItem('jwt');
      if (!token) { set({ loading: false }); return; }
      set({ token });
      const { data } = await api.get('/api/auth/me');
      set({ user: data.user, plan: data.plan, loading: false });
    } catch {
      await deleteItem('jwt');
      set({ user: null, plan: null, token: null, loading: false });
    }
  },

  isPremium: () => get().plan?.id === 'premium',

  canSendMessage: () => {
    const { user, plan } = get();
    if (!user || !plan) return false;
    if (plan.limits.messagesPerDay === null) return true;
    return user.dailyMsgCount < plan.limits.messagesPerDay;
  },
}));
