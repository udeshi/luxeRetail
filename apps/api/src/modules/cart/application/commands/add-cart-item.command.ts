import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CART_REPOSITORY, type CartRepository } from '../../domain/cart.repository';
import type { CartEntity } from '../../domain/cart.entity';

export class AddCartItemCommand {
  constructor(
    public readonly userId: string,
    public readonly productVariantId: string,
    public readonly quantity: number,
  ) {}
}

@Injectable()
@CommandHandler(AddCartItemCommand)
export class AddCartItemHandler implements ICommandHandler<AddCartItemCommand, CartEntity> {
  constructor(@Inject(CART_REPOSITORY) private readonly carts: CartRepository) {}

  execute(command: AddCartItemCommand): Promise<CartEntity> {
    return this.carts.addItem(command.userId, command.productVariantId, command.quantity);
  }
}
