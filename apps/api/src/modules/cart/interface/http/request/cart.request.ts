import { createZodDto } from 'nestjs-zod';
import { AddCartItemRequestSchema, UpdateCartItemRequestSchema } from '@org/contracts';

export class AddCartItemRequestDto extends createZodDto(AddCartItemRequestSchema) {}
export class UpdateCartItemRequestDto extends createZodDto(UpdateCartItemRequestSchema) {}
