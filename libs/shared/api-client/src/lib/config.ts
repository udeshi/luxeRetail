/**
 * The storefront, admin, and mobile apps each call configureApiClient()
 * once at startup with their own base URL and token storage — that's the
 * only thing that differs between platforms. Everything downstream (every
 * fetch call, every React Query hook) is shared, platform-agnostic code.
 */
export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken: () => string | null;
  /** Mobile only — web relies on the httpOnly refresh cookie instead. */
  getRefreshToken?: () => string | null;
  onTokensRefreshed: (tokens: { accessToken: string; refreshToken: string }) => void;
  /** Called when a request 401s and the refresh attempt also fails — the app should clear its session and redirect to login. */
  onUnauthorized: () => void;
}

let config: ApiClientConfig | null = null;

export function configureApiClient(next: ApiClientConfig): void {
  config = next;
}

export function getApiClientConfig(): ApiClientConfig {
  if (!config) {
    throw new Error('API client not configured — call configureApiClient() once at app startup');
  }
  return config;
}
