import { createZodDto } from 'nestjs-zod';
import { LoginRequestSchema, RefreshRequestSchema, RegisterRequestSchema } from '@org/contracts';

// nestjs-zod DTO classes: the shared Zod schema doubles as (a) the runtime
// validator (via the global ZodValidationPipe, see main.ts) and (b) the
// Swagger request schema — one definition, not two that can drift apart.
export class RegisterRequestDto extends createZodDto(RegisterRequestSchema) {}
export class LoginRequestDto extends createZodDto(LoginRequestSchema) {}
export class RefreshRequestDto extends createZodDto(RefreshRequestSchema) {}
