import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ORDER_REPOSITORY, type OrderRepository } from '../../domain/order.repository';
import type { OrderEntity } from '../../domain/order.entity';

export class GetOrderQuery {
  constructor(
    public readonly orderId: string,
    public readonly requestingUser: { id: string; role: 'CUSTOMER' | 'ADMIN' },
  ) {}
}

@Injectable()
@QueryHandler(GetOrderQuery)
export class GetOrderHandler implements IQueryHandler<GetOrderQuery, OrderEntity> {
  constructor(@Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository) {}

  async execute(query: GetOrderQuery): Promise<OrderEntity> {
    const order = await this.orders.findById(query.orderId);
    if (!order) throw new NotFoundException('Order not found');

    const isOwner = order.userId === query.requestingUser.id;
    const isAdmin = query.requestingUser.role === 'ADMIN';
    if (!isOwner && !isAdmin) throw new ForbiddenException('You do not have access to this order');

    return order;
  }
}
