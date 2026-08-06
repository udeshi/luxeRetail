import { redirect } from '@tanstack/react-router';
import { useSessionStore } from './session-store.js';

export function requireAdmin() {
  const { accessToken, user } = useSessionStore.getState();
  if (!accessToken || user?.role !== 'ADMIN') {
    throw redirect({ to: '/login' });
  }
}
