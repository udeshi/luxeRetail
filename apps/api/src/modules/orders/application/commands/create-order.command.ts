import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CART_REPOSITORY, type CartRepository } from '../../../cart/domain/cart.repository';
import { PAYMENT_GATEWAY, type PaymentGateway } from '../../../payments/domain/payment-gateway.port';
import { PAYMENT_REPOSITORY, type PaymentRepository } from '../../../payments/domain/payment.repository';
import { ORDER_REPOSITORY, type OrderRepository } from '../../domain/order.repository';
import type { OrderEntity, ShippingAddress } from '../../domain/order.entity';

export class CreateOrderCommand {
  constructor(
    public readonly userId: string,
    public readonly shippingAddress: ShippingAddress,
  ) {}
}

export interface CreateOrderResult {
  order: OrderEntity;
  clientSecret: string;
}

/** Free shipping over $200, flat $15 otherwise — deliberately simple; a real
 *  store would price this by weight/destination via a shipping-rate port. */
const FREE_SHIPPING_THRESHOLD_CENTS = 20_000;
const FLAT_SHIPPING_CENTS = 1_500;

@Injectable()
@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand, CreateOrderResult> {
  constructor(
    @Inject(CART_REPOSITORY) private readonly carts: CartRepository,
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    @Inject(PAYMENT_GATEWAY) private readonly paymentGateway: PaymentGateway,
    @Inject(PAYMENT_REPOSITORY) private readonly payments: PaymentRepository,
  ) {}

  async execute(command: CreateOrderCommand): Promise<CreateOrderResult> {
    const cart = await this.carts.getOrCreateForUser(command.userId);
    if (cart.items.length === 0) throw new BadRequestException('Cannot check out an empty cart');

    const subtotalCents = cart.subtotalCents;
    const shippingCents = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
    const totalCents = subtotalCents + shippingCents;

    let order = await this.orders.create({
      userId: command.userId,
      items: cart.items.map((item) => ({
        productVariantId: item.productVariantId,
        productName: item.productName,
        variantAttributes: item.variantAttributes,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
      })),
      subtotalCents,
      shippingCents,
      totalCents,
      currency: cart.currency,
      shippingAddress: command.shippingAddress,
    });

    const { providerPaymentId, clientSecret } = await this.paymentGateway.createPaymentIntent({
      orderId: order.id,
      amountCents: totalCents,
      currency: cart.currency,
    });

    await this.orders.attachPaymentIntent(order.id, providerPaymentId);
    await this.payments.create({ orderId: order.id, providerPaymentId, amountCents: totalCents, currency: cart.currency });
    await this.carts.clear(command.userId);

    order = { ...order, stripePaymentIntentId: providerPaymentId };
    return { order, clientSecret };
  }
}
