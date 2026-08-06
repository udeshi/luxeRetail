import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CartModule } from '../cart/cart.module';
import { PaymentsModule } from '../payments/payments.module';
import { OrdersController } from './interface/http/orders.controller';
import { ORDER_REPOSITORY } from './domain/order.repository';
import { PrismaOrderRepository } from './infrastructure/prisma-order.repository';
import { CreateOrderHandler } from './application/commands/create-order.command';
import { UpdateOrderStatusHandler } from './application/commands/update-order-status.command';
import { ConfirmPaymentHandler } from './application/commands/confirm-payment.command';
import { ListMyOrdersHandler } from './application/queries/list-my-orders.query';
import { ListAllOrdersHandler } from './application/queries/list-all-orders.query';
import { GetOrderHandler } from './application/queries/get-order.query';

const commandHandlers = [CreateOrderHandler, UpdateOrderStatusHandler, ConfirmPaymentHandler];
const queryHandlers = [ListMyOrdersHandler, ListAllOrdersHandler, GetOrderHandler];

@Module({
  // Orders depends on Cart (to check out) and Payments (to charge) — a
  // one-directional edge. Payments never imports Orders back; the webhook
  // controller reaches ConfirmPaymentHandler purely by dispatching its
  // Command class through the CommandBus, not by importing this module.
  imports: [CqrsModule, CartModule, PaymentsModule],
  controllers: [OrdersController],
  providers: [
    { provide: ORDER_REPOSITORY, useClass: PrismaOrderRepository },
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [ORDER_REPOSITORY],
})
export class OrdersModule {}
