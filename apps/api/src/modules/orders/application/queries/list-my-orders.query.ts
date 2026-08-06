import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ORDER_REPOSITORY, type ListOrdersFilter, type ListOrdersResult, type OrderRepository } from '../../domain/order.repository';

export class ListMyOrdersQuery {
  constructor(
    public readonly userId: string,
    public readonly filter: ListOrdersFilter,
  ) {}
}

@Injectable()
@QueryHandler(ListMyOrdersQuery)
export class ListMyOrdersHandler implements IQueryHandler<ListMyOrdersQuery, ListOrdersResult> {
  constructor(@Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository) {}

  execute(query: ListMyOrdersQuery): Promise<ListOrdersResult> {
    return this.orders.findManyForUser(query.userId, query.filter);
  }
}
