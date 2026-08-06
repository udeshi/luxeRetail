import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { REFRESH_TOKEN_REPOSITORY, type RefreshTokenRepository } from '../../domain/refresh-token.repository';
import { TokenService } from '../services/token.service';

export class LogoutCommand {
  constructor(public readonly refreshToken: string) {}
}

@Injectable()
@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
    private readonly tokens: TokenService,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    // Idempotent by design: an already-revoked or unknown token is not an
    // error — the caller's goal (no valid session) is already achieved.
    await this.refreshTokens.revokeByHash(this.tokens.hash(command.refreshToken));
  }
}
