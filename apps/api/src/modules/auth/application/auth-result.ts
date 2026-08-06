import type { UserEntity } from '../domain/user.entity';

/** Common result shape for register/login/refresh — the controller maps
 *  this to AuthResponseDto and also uses `refreshToken` to set the cookie. */
export interface AuthResult {
  user: UserEntity;
  accessToken: string;
  refreshToken: string;
}
