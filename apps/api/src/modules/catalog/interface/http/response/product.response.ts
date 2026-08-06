import { createZodDto } from 'nestjs-zod';
import { paginatedResponseSchema, ProductSchema, ProductSummarySchema } from '@org/contracts';

export class ProductResponseDto extends createZodDto(ProductSchema) {}
export class ProductListResponseDto extends createZodDto(paginatedResponseSchema(ProductSummarySchema)) {}
