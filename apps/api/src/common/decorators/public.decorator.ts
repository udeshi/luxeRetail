import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marks a route as reachable without a valid access token. Auth is global
 *  by default (see JwtAuthGuard) precisely so a route needs an explicit,
 *  visible opt-out like this rather than an easy-to-miss opt-in. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
