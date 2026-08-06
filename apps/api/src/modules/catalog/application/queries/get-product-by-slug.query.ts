import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PRODUCT_REPOSITORY, type ProductRepository } from '../../domain/product.repository';
import type { ProductEntity } from '../../domain/product.entity';

export class GetProductBySlugQuery {
  constructor(public readonly slug: string) {}
}

@Injectable()
@QueryHandler(GetProductBySlugQuery)
export class GetProductBySlugHandler implements IQueryHandler<GetProductBySlugQuery, ProductEntity> {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository) {}

  async execute(query: GetProductBySlugQuery): Promise<ProductEntity> {
    const product = await this.products.findBySlug(query.slug);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
