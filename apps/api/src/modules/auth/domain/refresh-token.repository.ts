export interface RefreshTokenEntity {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

/** Port. Refresh tokens are stored hashed (never the raw token) so a DB leak
 *  alone can't be used to mint sessions. */
export interface RefreshTokenRepository {
  create(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<RefreshTokenEntity>;
  findValidByHash(tokenHash: string): Promise<RefreshTokenEntity | null>;
  revokeByHash(tokenHash: string): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY');
