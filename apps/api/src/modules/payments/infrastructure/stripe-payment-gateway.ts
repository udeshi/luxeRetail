import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { TypedConfigService } from '../../../config/config.module';
import type { NormalizedPaymentEvent, PaymentGateway } from '../domain/payment-gateway.port';

@Injectable()
export class StripePaymentGateway implements PaymentGateway {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(config: TypedConfigService) {
    this.stripe = new Stripe(config.get('STRIPE_SECRET_KEY'));
    this.webhookSecret = config.get('STRIPE_WEBHOOK_SECRET');
  }

  async createPaymentIntent(input: {
    orderId: string;
    amountCents: number;
    currency: string;
  }): Promise<{ providerPaymentId: string; clientSecret: string }> {
    const intent = await this.stripe.paymentIntents.create({
      amount: input.amountCents,
      currency: input.currency,
      metadata: { orderId: input.orderId },
      automatic_payment_methods: { enabled: true },
    });
    if (!intent.client_secret) throw new Error('Stripe did not return a client secret');
    return { providerPaymentId: intent.id, clientSecret: intent.client_secret };
  }

  parseWebhookEvent(rawBody: Buffer, signatureHeader: string): NormalizedPaymentEvent {
    const event = this.stripe.webhooks.constructEvent(rawBody, signatureHeader, this.webhookSecret);

    switch (event.type) {
      case 'payment_intent.succeeded':
        return { type: 'payment_succeeded', providerPaymentId: event.data.object.id };
      case 'payment_intent.payment_failed':
        return { type: 'payment_failed', providerPaymentId: event.data.object.id };
      default:
        return { type: 'ignored' };
    }
  }
}
