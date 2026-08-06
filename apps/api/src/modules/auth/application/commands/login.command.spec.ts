import { UnauthorizedException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { LoginCommand, LoginHandler } from './login.command';
import type { UserRepository } from '../../domain/user.repository';
import type { RefreshTokenRepository } from '../../domain/refresh-token.repository';
import type { TokenService } from '../services/token.service';
import type { UserEntity } from '../../domain/user.entity';

/**
 * Exercises the handler directly — no HTTP, no NestJS TestingModule, no
 * database. This is what the ports & adapters split buys: business logic
 * is testable in isolation because it only ever depends on interfaces.
 */
describe('LoginHandler', () => {
  let user: UserEntity;
  let users: jest.Mocked<UserRepository>;
  let refreshTokens: jest.Mocked<RefreshTokenRepository>;
  let tokens: jest.Mocked<TokenService>;
  let handler: LoginHandler;

  beforeEach(async () => {
    user = {
      id: 'user-1',
      email: 'customer@luxeretail.dev',
      passwordHash: await hash('Password123!', 4), // low cost factor — this is a test, not production
      firstName: 'Sam',
      lastName: 'Customer',
      role: 'CUSTOMER',
      createdAt: new Date(),
    };

    users = { findByEmail: jest.fn(), findById: jest.fn(), create: jest.fn() };
    refreshTokens = { create: jest.fn(), findValidByHash: jest.fn(), revokeByHash: jest.fn() };
    tokens = {
      signAccessToken: jest.fn().mockReturnValue('access-token'),
      signRefreshToken: jest.fn().mockReturnValue({ token: 'refresh-token', expiresAt: new Date() }),
      verifyRefreshToken: jest.fn(),
      hash: jest.fn().mockReturnValue('hashed-refresh-token'),
    } as unknown as jest.Mocked<TokenService>;

    handler = new LoginHandler(users, refreshTokens, tokens);
  });

  it('issues tokens and persists a hashed refresh token on valid credentials', async () => {
    users.findByEmail.mockResolvedValue(user);

    const result = await handler.execute(new LoginCommand(user.email, 'Password123!'));

    expect(result.user).toBe(user);
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(refreshTokens.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: user.id, tokenHash: 'hashed-refresh-token' }),
    );
  });

  it('rejects an unknown email without revealing that the email is the problem', async () => {
    users.findByEmail.mockResolvedValue(null);

    await expect(handler.execute(new LoginCommand('nobody@luxeretail.dev', 'whatever'))).rejects.toThrow(
      UnauthorizedException,
    );
    expect(refreshTokens.create).not.toHaveBeenCalled();
  });

  it('rejects a wrong password with the same error as an unknown email', async () => {
    users.findByEmail.mockResolvedValue(user);

    await expect(handler.execute(new LoginCommand(user.email, 'wrong-password'))).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
