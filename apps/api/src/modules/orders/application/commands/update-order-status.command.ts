import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ORDER_REPOSITORY, type OrderRepository } from '../../domain/order.repository';
import type { OrderEntity, OrderStatus } from '../../domain/order.entity';

export class UpdateOrderStatusCommand {
  constructor(
    public readonly orderId: string,
    public readonly status: OrderStatus,
  ) {}
}

@Injectable()
@CommandHandler(UpdateOrderStatusCommand)
export class UpdateOrderStatusHandler implements ICommandHandler<UpdateOrderStatusCommand, OrderEntity> {
  constructor(@Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository) {}

  async execute(command: UpdateOrderStatusCommand): Promise<OrderEntity> {
    const existing = await this.orders.findById(command.orderId);
    if (!existing) throw new NotFoundException('Order not found');
    return this.orders.updateStatus(command.orderId, command.status);
  }
}
