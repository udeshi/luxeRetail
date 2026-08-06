import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CART_REPOSITORY, type CartRepository } from '../../domain/cart.repository';
import type { CartEntity } from '../../domain/cart.entity';

export class GetCartQuery {
  constructor(public readonly userId: string) {}
}

@Injectable()
@QueryHandler(GetCartQuery)
export class GetCartHandler implements IQueryHandler<GetCartQuery, CartEntity> {
  constructor(@Inject(CART_REPOSITORY) private readonly carts: CartRepository) {}

  execute(query: GetCartQuery): Promise<CartEntity> {
    return this.carts.getOrCreateForUser(query.userId);
  }
}
