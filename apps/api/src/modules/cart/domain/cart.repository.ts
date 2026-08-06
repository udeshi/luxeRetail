import type { CartEntity } from './cart.entity';

export interface CartRepository {
  getOrCreateForUser(userId: string): Promise<CartEntity>;
  /** Adds `quantity` of a variant, or increments it if already present (snapshotting the current price on first add). */
  addItem(userId: string, productVariantId: string, quantity: number): Promise<CartEntity>;
  /** Sets an item's quantity to an absolute value; 0 removes it. Throws if the item doesn't belong to this user's cart. */
  setItemQuantity(userId: string, cartItemId: string, quantity: number): Promise<CartEntity>;
  clear(userId: string): Promise<CartEntity>;
}

export const CART_REPOSITORY = Symbol('CART_REPOSITORY');
