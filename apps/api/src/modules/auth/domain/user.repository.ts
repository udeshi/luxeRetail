import type { UserEntity } from './user.entity';

/** Port. Application code depends on this interface, never on Prisma. */
export interface UserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  create(input: { email: string; passwordHash: string; firstName: string; lastName: string }): Promise<UserEntity>;
}

/** DI token — interfaces have no runtime identity, so we bind the port to
 *  its Prisma-backed adapter through this token (see auth.module.ts). */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
