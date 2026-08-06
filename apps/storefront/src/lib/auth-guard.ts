import { redirect } from '@tanstack/react-router';
import { useSessionStore } from './session-store.js';

/** Call from a route's `beforeLoad` to gate it behind a signed-in session —
 *  e.g. `beforeLoad: requireAuth`. Runs outside React, so it reads the
 *  Zustand store's vanilla getState() rather than the useSessionStore hook. */
export function requireAuth() {
  if (!useSessionStore.getState().accessToken) {
    throw redirect({ to: '/login' });
  }
}
