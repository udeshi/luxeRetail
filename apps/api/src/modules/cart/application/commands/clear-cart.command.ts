import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CART_REPOSITORY, type CartRepository } from '../../domain/cart.repository';
import type { CartEntity } from '../../domain/cart.entity';

export class ClearCartCommand {
  constructor(public readonly userId: string) {}
}

@Injectable()
@CommandHandler(ClearCartCommand)
export class ClearCartHandler implements ICommandHandler<ClearCartCommand, CartEntity> {
  constructor(@Inject(CART_REPOSITORY) private readonly carts: CartRepository) {}

  execute(command: ClearCartCommand): Promise<CartEntity> {
    return this.carts.clear(command.userId);
  }
}
