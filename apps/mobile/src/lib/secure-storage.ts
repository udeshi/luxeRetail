import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'luxeretail.accessToken';
const REFRESH_TOKEN_KEY = 'luxeretail.refreshToken';

/** Mobile has no httpOnly-cookie option, so both tokens are persisted here
 *  instead — the OS keychain/keystore, not AsyncStorage, which is
 *  unencrypted. See ARCHITECTURE.md "Auth". */
export const secureStorage = {
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },
  async loadRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },
  async clear(): Promise<void> {
    await Promise.all([SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY), SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)]);
  },
};
