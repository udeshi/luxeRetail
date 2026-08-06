import { authApi, configureApiClient } from '@org/api-client';
import { useSessionStore } from './session-store.js';

configureApiClient({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  getAccessToken: () => useSessionStore.getState().accessToken,
  onTokensRefreshed: ({ accessToken }) => {
    const { user, setSession } = useSessionStore.getState();
    if (user) setSession(user, accessToken);
  },
  onUnauthorized: () => useSessionStore.getState().clearSession(),
});

export async function bootstrapSession(): Promise<void> {
  try {
    const result = await authApi.refresh();
    if (result.user.role !== 'ADMIN') {
      // A customer's refresh cookie leaking into the admin app's origin
      // shouldn't silently sign them into the admin console.
      useSessionStore.getState().clearSession();
      return;
    }
    useSessionStore.getState().setSession(result.user, result.accessToken);
  } catch {
    useSessionStore.getState().clearSession();
  }
}
