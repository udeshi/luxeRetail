import { Inject, Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { formatPrice } from '@org/utils';
import { OrderPaidEvent } from '../../orders/domain/events/order-paid.event';
import { ORDER_REPOSITORY, type OrderRepository } from '../../orders/domain/order.repository';
import { USER_REPOSITORY, type UserRepository } from '../../auth/domain/user.repository';
import { EMAIL_QUEUE } from '../infrastructure/email.processor';
import type { EmailJobData } from '../infrastructure/mailer.service';

/** Reacts to orders' OrderPaidEvent — orders has no idea email exists,
 *  it just publishes a fact. This is the same decoupling pattern as
 *  cart's UserRegisteredEvent handler. */
@Injectable()
@EventsHandler(OrderPaidEvent)
export class SendOrderConfirmationHandler implements IEventHandler<OrderPaidEvent> {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue<EmailJobData>,
  ) {}

  async handle(event: OrderPaidEvent): Promise<void> {
    const [order, user] = await Promise.all([this.orders.findById(event.orderId), this.users.findById(event.userId)]);
    if (!order || !user) return;

    const lines = order.items.map((item) => `  ${item.quantity}x ${item.productName} — ${formatPrice(item.unitPriceCents, order.currency)}`);
    const text = [
      `Hi ${user.firstName}, thanks for your order!`,
      '',
      `Order #${order.id}`,
      ...lines,
      '',
      `Total: ${formatPrice(order.totalCents, order.currency)}`,
    ].join('\n');

    await this.emailQueue.add('order-confirmation', {
      to: user.email,
      subject: `Your LuxeRetail order #${order.id.slice(0, 8)} is confirmed`,
      text,
    });
  }
}
