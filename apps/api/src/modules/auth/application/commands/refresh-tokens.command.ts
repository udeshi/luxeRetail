import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { USER_REPOSITORY, type UserRepository } from '../../domain/user.repository';
import { REFRESH_TOKEN_REPOSITORY, type RefreshTokenRepository } from '../../domain/refresh-token.repository';
import { TokenService } from '../services/token.service';
import type { AuthResult } from '../auth-result';

export class RefreshTokensCommand {
  constructor(public readonly refreshToken: string) {}
}

@Injectable()
@CommandHandler(RefreshTokensCommand)
export class RefreshTokensHandler implements ICommandHandler<RefreshTokensCommand, AuthResult> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
    private readonly tokens: TokenService,
  ) {}

  async execute(command: RefreshTokensCommand): Promise<AuthResult> {
    let payload: { sub: string };
    try {
      payload = this.tokens.verifyRefreshToken(command.refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokenHash = this.tokens.hash(command.refreshToken);
    const stored = await this.refreshTokens.findValidByHash(tokenHash);
    if (!stored) throw new UnauthorizedException('Refresh token has been revoked or reused');

    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User no longer exists');

    // Rotate: the old refresh token is single-use. If it's ever presented
    // again (e.g. stolen and replayed) it's already revoked and fails above.
    await this.refreshTokens.revokeByHash(tokenHash);

    const accessToken = this.tokens.signAccessToken(user);
    const { token: newRefreshToken, expiresAt } = this.tokens.signRefreshToken(user.id);
    await this.refreshTokens.create({ userId: user.id, tokenHash: this.tokens.hash(newRefreshToken), expiresAt });

    return { user, accessToken, refreshToken: newRefreshToken };
  }
}
