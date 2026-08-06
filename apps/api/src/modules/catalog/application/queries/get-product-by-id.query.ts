import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PRODUCT_REPOSITORY, type ProductRepository } from '../../domain/product.repository';
import type { ProductEntity } from '../../domain/product.entity';

/** Admin-only counterpart to GetProductBySlugQuery — returns a product
 *  regardless of status (draft/archived included) since the storefront's
 *  by-slug lookup deliberately hides anything that isn't ACTIVE. */
export class GetProductByIdQuery {
  constructor(public readonly productId: string) {}
}

@Injectable()
@QueryHandler(GetProductByIdQuery)
export class GetProductByIdHandler implements IQueryHandler<GetProductByIdQuery, ProductEntity> {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository) {}

  async execute(query: GetProductByIdQuery): Promise<ProductEntity> {
    const product = await this.products.findById(query.productId);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
