import type { User } from '@org/contracts';
import type { UserEntity } from '../../../domain/user.entity';
import type { AuthResult } from '../../../application/auth-result';
import type { AuthResponseDto } from '../response/auth.response';

/** Translates domain entities <-> the HTTP response shape. Controllers
 *  never serialize a domain entity directly — the password hash on
 *  UserEntity is exactly the kind of field a mapper exists to drop. */
export class UserMapper {
  static toResponse(user: UserEntity): User {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

export class AuthMapper {
  static toResponse(result: AuthResult): AuthResponseDto {
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: UserMapper.toResponse(result.user),
    };
  }
}
