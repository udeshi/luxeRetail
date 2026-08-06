import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CartController } from './interface/http/cart.controller';
import { CART_REPOSITORY } from './domain/cart.repository';
import { PrismaCartRepository } from './infrastructure/prisma-cart.repository';
import { AddCartItemHandler } from './application/commands/add-cart-item.command';
import { UpdateCartItemHandler } from './application/commands/update-cart-item.command';
import { ClearCartHandler } from './application/commands/clear-cart.command';
import { GetCartHandler } from './application/queries/get-cart.query';
import { CreateCartOnRegistrationHandler } from './application/events/create-cart-on-registration.handler';

const commandHandlers = [AddCartItemHandler, UpdateCartItemHandler, ClearCartHandler];
const queryHandlers = [GetCartHandler];
const eventHandlers = [CreateCartOnRegistrationHandler];

@Module({
  imports: [CqrsModule],
  controllers: [CartController],
  providers: [
    { provide: CART_REPOSITORY, useClass: PrismaCartRepository },
    ...commandHandlers,
    ...queryHandlers,
    ...eventHandlers,
  ],
  exports: [CART_REPOSITORY],
})
export class CartModule {}
