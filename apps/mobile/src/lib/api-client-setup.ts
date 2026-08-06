import { authApi, configureApiClient } from '@org/api-client';
import { useSessionStore } from './session-store';
import { secureStorage } from './secure-storage';

configureApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  getAccessToken: () => useSessionStore.getState().accessToken,
  getRefreshToken: () => useSessionStore.getState().refreshToken,
  onTokensRefreshed: ({ accessToken, refreshToken }) => {
    const { user, setSession } = useSessionStore.getState();
    if (user) setSession(user, accessToken, refreshToken);
  },
  onUnauthorized: () => useSessionStore.getState().clearSession(),
});

/** Called once on app start: exchanges a SecureStore-persisted refresh
 *  token for a fresh session, so the app doesn't force a re-login every
 *  time it's reopened. */
export async function bootstrapSession(): Promise<void> {
  const refreshToken = await secureStorage.loadRefreshToken();
  if (!refreshToken) {
    useSessionStore.getState().clearSession();
    return;
  }
  try {
    const result = await authApi.refresh(refreshToken);
    useSessionStore.getState().setSession(result.user, result.accessToken, result.refreshToken);
  } catch {
    useSessionStore.getState().clearSession();
  }
}
