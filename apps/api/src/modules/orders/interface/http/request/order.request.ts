import { createZodDto } from 'nestjs-zod';
import { CreateOrderRequestSchema, ListOrdersQuerySchema, UpdateOrderStatusRequestSchema } from '@org/contracts';

export class CreateOrderRequestDto extends createZodDto(CreateOrderRequestSchema) {}
export class UpdateOrderStatusRequestDto extends createZodDto(UpdateOrderStatusRequestSchema) {}
export class ListOrdersQueryDto extends createZodDto(ListOrdersQuerySchema) {}
