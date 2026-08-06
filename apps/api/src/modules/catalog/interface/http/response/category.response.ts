import { createZodDto } from 'nestjs-zod';
import { CategorySchema } from '@org/contracts';

export class CategoryResponseDto extends createZodDto(CategorySchema) {}
