import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CART_REPOSITORY, type CartRepository } from '../../domain/cart.repository';
import type { CartEntity } from '../../domain/cart.entity';

export class UpdateCartItemCommand {
  constructor(
    public readonly userId: string,
    public readonly cartItemId: string,
    public readonly quantity: number,
  ) {}
}

@Injectable()
@CommandHandler(UpdateCartItemCommand)
export class UpdateCartItemHandler implements ICommandHandler<UpdateCartItemCommand, CartEntity> {
  constructor(@Inject(CART_REPOSITORY) private readonly carts: CartRepository) {}

  execute(command: UpdateCartItemCommand): Promise<CartEntity> {
    return this.carts.setItemQuantity(command.userId, command.cartItemId, command.quantity);
  }
}
