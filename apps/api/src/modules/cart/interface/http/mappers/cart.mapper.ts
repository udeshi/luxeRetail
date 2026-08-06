import type { Cart } from '@org/contracts';
import type { CartEntity } from '../../../domain/cart.entity';

export class CartMapper {
  static toResponse(cart: CartEntity): Cart {
    return cart;
  }
}
