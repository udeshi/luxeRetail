import { createZodDto } from 'nestjs-zod';
import { CreateOrderResponseSchema, OrderSchema, OrderSummarySchema, paginatedResponseSchema } from '@org/contracts';

export class OrderResponseDto extends createZodDto(OrderSchema) {}
export class OrderListResponseDto extends createZodDto(paginatedResponseSchema(OrderSummarySchema)) {}
export class CreateOrderResponseDto extends createZodDto(CreateOrderResponseSchema) {}
