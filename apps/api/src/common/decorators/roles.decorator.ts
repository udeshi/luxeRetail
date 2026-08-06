import { SetMetadata } from '@nestjs/common';
import type { $Enums } from '../../generated/prisma/client';

export const ROLES_KEY = 'roles';

/** Restricts a route to the given roles. Requires JwtAuthGuard to have run
 *  first (RolesGuard reads the user JwtAuthGuard attached to the request). */
export const Roles = (...roles: $Enums.Role[]) => SetMetadata(ROLES_KEY, roles);
