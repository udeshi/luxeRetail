import { z } from 'zod';
import { UserSchema } from './user.schema';

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RefreshRequestSchema = z.object({
  // Web relies on the httpOnly cookie and can omit this; mobile sends the
  // token it persisted in SecureStore explicitly.
  refreshToken: z.string().min(1).optional(),
});
export type RefreshRequest = z.infer<typeof RefreshRequestSchema>;

/**
 * Returned by /auth/login, /auth/register, and /auth/refresh. Web ignores
 * the tokens in the body (it already got an httpOnly refresh cookie) and
 * keeps the access token in memory only; mobile persists both fields in
 * SecureStore. See ARCHITECTURE.md "Auth" for the full rationale.
 */
export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserSchema,
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
