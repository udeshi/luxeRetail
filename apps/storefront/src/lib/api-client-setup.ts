import { authApi, configureApiClient } from '@org/api-client';
import { useSessionStore } from './session-store.js';

configureApiClient({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  getAccessToken: () => useSessionStore.getState().accessToken,
  // No getRefreshToken — web never handles the refresh token directly, the
  // httpOnly cookie is sent automatically by the browser.
  onTokensRefreshed: ({ accessToken }) => {
    const { user, setSession } = useSessionStore.getState();
    if (user) setSession(user, accessToken);
  },
  onUnauthorized: () => useSessionStore.getState().clearSession(),
});

/** Called once on app start: exchanges the httpOnly refresh cookie (if any)
 *  for a fresh access token, so a page reload doesn't force a re-login. */
export async function bootstrapSession(): Promise<void> {
  try {
    const result = await authApi.refresh();
    useSessionStore.getState().setSession(result.user, result.accessToken);
  } catch {
    useSessionStore.getState().clearSession();
  }
}
