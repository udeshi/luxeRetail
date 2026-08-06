import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import ms, { type StringValue } from 'ms';
import { TypedConfigService } from '../../../../config/config.module';
import type { UserEntity } from '../../domain/user.entity';

/**
 * A single JwtService signs/verifies both token kinds — @nestjs/jwt lets a
 * per-call `secret`/`expiresIn` override the module default, so access and
 * refresh tokens don't need two separately-registered modules.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: TypedConfigService,
  ) {}

  signAccessToken(user: Pick<UserEntity, 'id' | 'email' | 'role'>): string {
    return this.jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      { secret: this.config.get('JWT_ACCESS_SECRET'), expiresIn: this.asTtl(this.config.get('JWT_ACCESS_TTL')) },
    );
  }

  signRefreshToken(userId: string): { token: string; expiresAt: Date } {
    const ttl = this.asTtl(this.config.get('JWT_REFRESH_TTL'));
    const token = this.jwt.sign({ sub: userId }, { secret: this.config.get('JWT_REFRESH_SECRET'), expiresIn: ttl });
    return { token, expiresAt: new Date(Date.now() + ms(ttl)) };
  }

  /** Throws if the token is expired or signed with the wrong secret. */
  verifyRefreshToken(token: string): { sub: string } {
    return this.jwt.verify(token, { secret: this.config.get('JWT_REFRESH_SECRET') });
  }

  /** Refresh tokens are stored hashed — this is a deterministic lookup hash, not a password hash. */
  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  // Config values are validated at boot (env.schema.ts) but arrive as plain
  // `string` — this asserts the shape `ms`/jsonwebtoken expect ("15m",
  // "30d", ...) without loosening the env schema itself to a literal union.
  private asTtl(value: string): StringValue {
    return value as StringValue;
  }
}
