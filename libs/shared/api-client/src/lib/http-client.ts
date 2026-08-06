import { ApiError } from './api-error';
import { getApiClientConfig } from './config';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

interface ProblemBody {
  title?: string;
  detail?: string;
  errors?: Array<{ path: string; message: string }>;
}

function buildUrl(baseUrl: string, path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${baseUrl}/api${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function rawRequest(path: string, options: RequestOptions, accessToken: string | null): Promise<Response> {
  const config = getApiClientConfig();
  return fetch(buildUrl(config.baseUrl, path, options.query), {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    // Carries the httpOnly refresh cookie for web; a harmless no-op on
    // React Native's fetch, which doesn't have a cookie jar to send anyway.
    credentials: 'include',
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

/** One silent refresh attempt on a 401 — not a queue, so concurrent 401s
 *  each retry independently. Fine at this app's scale; a busier app would
 *  dedupe concurrent refreshes behind a single in-flight promise. */
async function tryRefresh(): Promise<boolean> {
  const config = getApiClientConfig();
  const refreshToken = config.getRefreshToken?.();
  const response = await rawRequest(
    '/auth/refresh',
    { method: 'POST', body: refreshToken ? { refreshToken } : undefined },
    null,
  );
  if (!response.ok) return false;

  const data = (await response.json()) as { accessToken: string; refreshToken: string };
  config.onTokensRefreshed({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return true;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const config = getApiClientConfig();
  let response = await rawRequest(path, options, config.getAccessToken());

  if (response.status === 401 && path !== '/auth/refresh') {
    const refreshed = await tryRefresh();
    if (!refreshed) {
      config.onUnauthorized();
      throw new ApiError(401, 'Session expired — please sign in again');
    }
    response = await rawRequest(path, options, config.getAccessToken());
  }

  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as ProblemBody | null;
    throw new ApiError(response.status, problem?.detail ?? problem?.title ?? 'Request failed', problem?.errors);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
