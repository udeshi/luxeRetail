import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** The shape JwtStrategy.validate() returns, attached to `request.user` by
 *  Passport once a request passes JwtAuthGuard. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
}

/** @CurrentUser() in a controller method — never reach into `request.user`
 *  by hand, so there's exactly one place that knows the request's shape. */
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthenticatedUser => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
