import { createZodDto } from 'nestjs-zod';
import { CreateProductRequestSchema, ListProductsQuerySchema, UpdateProductRequestSchema } from '@org/contracts';

export class CreateProductRequestDto extends createZodDto(CreateProductRequestSchema) {}
export class UpdateProductRequestDto extends createZodDto(UpdateProductRequestSchema) {}
export class ListProductsQueryDto extends createZodDto(ListProductsQuerySchema) {}
