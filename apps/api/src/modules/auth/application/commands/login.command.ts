import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { compare } from 'bcrypt';
import { USER_REPOSITORY, type UserRepository } from '../../domain/user.repository';
import { REFRESH_TOKEN_REPOSITORY, type RefreshTokenRepository } from '../../domain/refresh-token.repository';
import { TokenService } from '../services/token.service';
import type { AuthResult } from '../auth-result';

export class LoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}

const INVALID_CREDENTIALS = 'Invalid email or password';

@Injectable()
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, AuthResult> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
    private readonly tokens: TokenService,
  ) {}

  async execute(command: LoginCommand): Promise<AuthResult> {
    const user = await this.users.findByEmail(command.email);
    // Same error whether the email or the password was wrong — never tell
    // an attacker which one.
    if (!user) throw new UnauthorizedException(INVALID_CREDENTIALS);

    const passwordMatches = await compare(command.password, user.passwordHash);
    if (!passwordMatches) throw new UnauthorizedException(INVALID_CREDENTIALS);

    const accessToken = this.tokens.signAccessToken(user);
    const { token: refreshToken, expiresAt } = this.tokens.signRefreshToken(user.id);
    await this.refreshTokens.create({ userId: user.id, tokenHash: this.tokens.hash(refreshToken), expiresAt });

    return { user, accessToken, refreshToken };
  }
}
