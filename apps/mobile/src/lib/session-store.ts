import { create } from 'zustand';
import type { User } from '@org/contracts';
import { secureStorage } from './secure-storage';

export type SessionStatus = 'idle' | 'authenticated' | 'unauthenticated';

interface SessionState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: SessionStatus;
  setSession: (user: User, accessToken: string, refreshToken: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  status: 'idle',
  setSession: (user, accessToken, refreshToken) => {
    set({ user, accessToken, refreshToken, status: 'authenticated' });
    void secureStorage.saveTokens(accessToken, refreshToken);
  },
  clearSession: () => {
    set({ user: null, accessToken: null, refreshToken: null, status: 'unauthenticated' });
    void secureStorage.clear();
  },
}));
