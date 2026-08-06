import { create } from 'zustand';
import type { User } from '@org/contracts';

export type SessionStatus = 'idle' | 'authenticated' | 'unauthenticated';

interface SessionState {
  user: User | null;
  accessToken: string | null;
  status: SessionStatus;
  setSession: (user: User, accessToken: string) => void;
  clearSession: () => void;
}

/**
 * Web keeps the access token in memory only (never localStorage — an XSS
 * payload reading persisted storage is a far more common attack than one
 * intercepting a variable). A page reload starts with no token and calls
 * bootstrapSession() below to silently restore it from the httpOnly
 * refresh cookie. See ARCHITECTURE.md "Auth".
 */
export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  accessToken: null,
  status: 'idle',
  setSession: (user, accessToken) => set({ user, accessToken, status: 'authenticated' }),
  clearSession: () => set({ user: null, accessToken: null, status: 'unauthenticated' }),
}));
