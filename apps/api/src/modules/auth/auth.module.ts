import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './interface/http/auth.controller';
import { USER_REPOSITORY } from './domain/user.repository';
import { REFRESH_TOKEN_REPOSITORY } from './domain/refresh-token.repository';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { PrismaRefreshTokenRepository } from './infrastructure/prisma-refresh-token.repository';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { TokenService } from './application/services/token.service';
import { RegisterUserHandler } from './application/commands/register-user.command';
import { LoginHandler } from './application/commands/login.command';
import { RefreshTokensHandler } from './application/commands/refresh-tokens.command';
import { LogoutHandler } from './application/commands/logout.command';
import { GetCurrentUserHandler } from './application/queries/get-current-user.query';

const commandHandlers = [RegisterUserHandler, LoginHandler, RefreshTokensHandler, LogoutHandler];
const queryHandlers = [GetCurrentUserHandler];

@Module({
  imports: [CqrsModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    TokenService,
    JwtStrategy,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: PrismaRefreshTokenRepository },
    ...commandHandlers,
    ...queryHandlers,
  ],
  // USER_REPOSITORY is exported so other modules (cart, orders) can resolve
  // a user's existence without duplicating the Prisma query themselves.
  exports: [USER_REPOSITORY],
})
export class AuthModule {}
