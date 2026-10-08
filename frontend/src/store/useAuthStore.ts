import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: (user: User, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nodewave_token', token);
      localStorage.setItem('nodewave_user', JSON.stringify(user));
    }
    set({ user, token, isLoading: false });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nodewave_token');
      localStorage.removeItem('nodewave_user');
    }
    set({ user: null, token: null, isLoading: false });
  },

  initialize: () => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('nodewave_token');
      const storedUser = localStorage.getItem('nodewave_user');
      if (storedToken && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          set({ user: parsed, token: storedToken, isLoading: false });
          return;
        } catch {
          // ignore corrupted data
        }
      }
    }
    set({ user: null, token: null, isLoading: false });
  },
}));

