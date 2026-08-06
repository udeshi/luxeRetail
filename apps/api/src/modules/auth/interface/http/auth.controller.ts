import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { CookieOptions, Request, Response } from 'express';
import { Public } from '../../../../common/decorators/public.decorator';
import { CurrentUser, type AuthenticatedUser } from '../../../../common/decorators/current-user.decorator';
import { RegisterUserCommand } from '../../application/commands/register-user.command';
import { LoginCommand } from '../../application/commands/login.command';
import { RefreshTokensCommand } from '../../application/commands/refresh-tokens.command';
import { LogoutCommand } from '../../application/commands/logout.command';
import { GetCurrentUserQuery } from '../../application/queries/get-current-user.query';
import { AuthMapper, UserMapper } from './mappers/user.mapper';
import { LoginRequestDto, RefreshRequestDto, RegisterRequestDto } from './request/auth.request';
import type { AuthResult } from '../../application/auth-result';

const REFRESH_COOKIE = 'refresh_token';
const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterRequestDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.commandBus.execute<RegisterUserCommand, AuthResult>(
      new RegisterUserCommand(dto.email, dto.password, dto.firstName, dto.lastName),
    );
    return this.respondWithSession(res, result);
  }

  @Public()
  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginRequestDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.commandBus.execute<LoginCommand, AuthResult>(new LoginCommand(dto.email, dto.password));
    return this.respondWithSession(res, result);
  }

  @Public()
  @HttpCode(200)
  @Post('refresh')
  async refresh(@Body() dto: RefreshRequestDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = dto.refreshToken ?? req.cookies?.[REFRESH_COOKIE];
    if (!token) throw new UnauthorizedException('Missing refresh token');

    const result = await this.commandBus.execute<RefreshTokensCommand, AuthResult>(new RefreshTokensCommand(token));
    return this.respondWithSession(res, result);
  }

  @Public()
  @HttpCode(204)
  @Post('logout')
  async logout(@Body() dto: RefreshRequestDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = dto.refreshToken ?? req.cookies?.[REFRESH_COOKIE];
    if (token) await this.commandBus.execute(new LogoutCommand(token));
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  }

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    const found = await this.queryBus.execute(new GetCurrentUserQuery(user.id));
    return UserMapper.toResponse(found);
  }

  /** Sets the httpOnly refresh cookie (web) and always returns both tokens
   *  in the body (mobile) — see ARCHITECTURE.md "Auth" for why one endpoint
   *  can serve both platforms without branching. */
  private respondWithSession(res: Response, result: AuthResult) {
    res.cookie(REFRESH_COOKIE, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    return AuthMapper.toResponse(result);
  }
}
