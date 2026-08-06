import { createZodDto } from 'nestjs-zod';
import { AuthResponseSchema, UserSchema } from '@org/contracts';

export class AuthResponseDto extends createZodDto(AuthResponseSchema) {}
export class UserResponseDto extends createZodDto(UserSchema) {}
