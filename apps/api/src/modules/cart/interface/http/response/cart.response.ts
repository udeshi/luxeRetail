import { createZodDto } from 'nestjs-zod';
import { CartSchema } from '@org/contracts';

export class CartResponseDto extends createZodDto(CartSchema) {}
