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

/** Same in-memory-access-token pattern as the storefront (see its
 *  session-store.ts) — the only admin-specific rule lives in login.tsx,
 *  which refuses to set a session for a non-ADMIN user at all. */
export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  accessToken: null,
  status: 'idle',
  setSession: (user, accessToken) => set({ user, accessToken, status: 'authenticated' }),
  clearSession: () => set({ user: null, accessToken: null, status: 'unauthenticated' }),
}));
