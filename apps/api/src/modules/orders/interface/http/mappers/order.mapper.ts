import type { CreateOrderResponse, Order, OrderSummary } from '@org/contracts';
import type { OrderEntity } from '../../../domain/order.entity';
import type { CreateOrderResult } from '../../../application/commands/create-order.command';
import type { ListOrdersResult } from '../../../domain/order.repository';

export class OrderMapper {
  static toResponse(order: OrderEntity): Order {
    return {
      id: order.id,
      status: order.status,
      items: order.items,
      subtotalCents: order.subtotalCents,
      shippingCents: order.shippingCents,
      totalCents: order.totalCents,
      currency: order.currency,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
    };
  }

  static toCreateResponse(result: CreateOrderResult): CreateOrderResponse {
    return { order: OrderMapper.toResponse(result.order), clientSecret: result.clientSecret };
  }

  static toSummaryResponse(summary: ListOrdersResult['items'][number]): OrderSummary {
    return summary;
  }

  static toListResponse(result: ListOrdersResult, page: number, pageSize: number) {
    return {
      items: result.items.map(OrderMapper.toSummaryResponse),
      page,
      pageSize,
      total: result.total,
      totalPages: Math.max(1, Math.ceil(result.total / pageSize)),
    };
  }
}
