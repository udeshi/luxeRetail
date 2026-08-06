import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ORDER_REPOSITORY, type ListOrdersFilter, type ListOrdersResult, type OrderRepository } from '../../domain/order.repository';

export class ListAllOrdersQuery {
  constructor(public readonly filter: ListOrdersFilter) {}
}

@Injectable()
@QueryHandler(ListAllOrdersQuery)
export class ListAllOrdersHandler implements IQueryHandler<ListAllOrdersQuery, ListOrdersResult> {
  constructor(@Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository) {}

  execute(query: ListAllOrdersQuery): Promise<ListOrdersResult> {
    return this.orders.findManyAdmin(query.filter);
  }
}
