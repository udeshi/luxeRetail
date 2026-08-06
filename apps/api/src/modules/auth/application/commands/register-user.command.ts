import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { hash } from 'bcrypt';
import { USER_REPOSITORY, type UserRepository } from '../../domain/user.repository';
import { REFRESH_TOKEN_REPOSITORY, type RefreshTokenRepository } from '../../domain/refresh-token.repository';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { TokenService } from '../services/token.service';
import type { AuthResult } from '../auth-result';

export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly firstName: string,
    public readonly lastName: string,
  ) {}
}

const BCRYPT_ROUNDS = 10;

@Injectable()
@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand, AuthResult> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
    private readonly tokens: TokenService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterUserCommand): Promise<AuthResult> {
    const existing = await this.users.findByEmail(command.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await hash(command.password, BCRYPT_ROUNDS);
    const user = await this.users.create({
      email: command.email,
      passwordHash,
      firstName: command.firstName,
      lastName: command.lastName,
    });

    this.eventBus.publish(new UserRegisteredEvent(user.id));

    const accessToken = this.tokens.signAccessToken(user);
    const { token: refreshToken, expiresAt } = this.tokens.signRefreshToken(user.id);
    await this.refreshTokens.create({ userId: user.id, tokenHash: this.tokens.hash(refreshToken), expiresAt });

    return { user, accessToken, refreshToken };
  }
}
