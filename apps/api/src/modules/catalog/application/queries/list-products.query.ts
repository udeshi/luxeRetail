import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PRODUCT_REPOSITORY, type ListProductsFilter, type ListProductsResult, type ProductRepository } from '../../domain/product.repository';

export class ListProductsQuery {
  constructor(public readonly filter: ListProductsFilter) {}
}

@Injectable()
@QueryHandler(ListProductsQuery)
export class ListProductsHandler implements IQueryHandler<ListProductsQuery, ListProductsResult> {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository) {}

  execute(query: ListProductsQuery): Promise<ListProductsResult> {
    return this.products.findMany(query.filter);
  }
}
