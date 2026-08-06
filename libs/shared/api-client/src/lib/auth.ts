import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@org/contracts';
import { apiFetch } from './http-client';
import { queryKeys } from './query-keys';

export const authApi = {
  register: (input: RegisterRequest) => apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: input }),
  login: (input: LoginRequest) => apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: input }),
  logout: (refreshToken?: string) => apiFetch<void>('/auth/logout', { method: 'POST', body: { refreshToken } }),
  me: () => apiFetch<User>('/auth/me'),
  /** Used directly (not just internally by http-client's 401 retry) so an
   *  app can silently restore a session on load from the refresh cookie —
   *  web keeps the access token in memory only, so a page reload has none. */
  refresh: (refreshToken?: string) => apiFetch<AuthResponse>('/auth/refresh', { method: 'POST', body: { refreshToken } }),
};

/** Enabled only once the app has an access token to check — call sites
 *  pass `enabled` from their own session store. */
export function useMe(enabled: boolean) {
  return useQuery({ queryKey: queryKeys.me, queryFn: authApi.me, enabled, retry: false });
}

export function useLogin(options?: UseMutationOptions<AuthResponse, Error, LoginRequest>) {
  return useMutation({ mutationFn: authApi.login, ...options });
}

export function useRegister(options?: UseMutationOptions<AuthResponse, Error, RegisterRequest>) {
  return useMutation({ mutationFn: authApi.register, ...options });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (refreshToken?: string) => authApi.logout(refreshToken),
    onSettled: () => queryClient.clear(), // drop every cached response — it belonged to the signed-out user
  });
}
