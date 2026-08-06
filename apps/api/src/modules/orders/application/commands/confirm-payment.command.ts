import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PAYMENT_REPOSITORY, type PaymentRepository } from '../../../payments/domain/payment.repository';
import { ORDER_REPOSITORY, type OrderRepository } from '../../domain/order.repository';
import { OrderPaidEvent } from '../../domain/events/order-paid.event';

/** Dispatched by the Stripe webhook controller after signature verification
 *  — this is the only place an order actually transitions to PAID. */
export class ConfirmPaymentCommand {
  constructor(
    public readonly providerPaymentId: string,
    public readonly outcome: 'succeeded' | 'failed',
  ) {}
}

@Injectable()
@CommandHandler(ConfirmPaymentCommand)
export class ConfirmPaymentHandler implements ICommandHandler<ConfirmPaymentCommand, void> {
  private readonly logger = new Logger(ConfirmPaymentHandler.name);

  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    @Inject(PAYMENT_REPOSITORY) private readonly payments: PaymentRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ConfirmPaymentCommand): Promise<void> {
    const order = await this.orders.findByStripePaymentIntentId(command.providerPaymentId);
    if (!order) {
      // Can legitimately happen for a PaymentIntent this API didn't create
      // (test events from the Stripe dashboard). Log and ignore rather than 500.
      this.logger.warn(`No order found for payment intent ${command.providerPaymentId}`);
      return;
    }

    if (command.outcome === 'succeeded') {
      await this.payments.updateStatusByProviderId(command.providerPaymentId, 'SUCCEEDED');
      await this.orders.updateStatus(order.id, 'PAID');
      this.eventBus.publish(new OrderPaidEvent(order.id, order.userId));
    } else {
      await this.payments.updateStatusByProviderId(command.providerPaymentId, 'FAILED');
    }
  }
}
