/** Port around the payment provider. Swapping Stripe for another PSP later
 *  means writing one new adapter — nothing in orders/ or the webhook
 *  controller's business logic changes. */
export interface PaymentGateway {
  createPaymentIntent(input: {
    orderId: string;
    amountCents: number;
    currency: string;
  }): Promise<{ providerPaymentId: string; clientSecret: string }>;

  /** Verifies the webhook signature and returns a normalized event —
   *  callers never touch the provider SDK's raw event type. */
  parseWebhookEvent(rawBody: Buffer, signatureHeader: string): NormalizedPaymentEvent;
}

export type NormalizedPaymentEvent =
  | { type: 'payment_succeeded'; providerPaymentId: string }
  | { type: 'payment_failed'; providerPaymentId: string }
  | { type: 'ignored' };

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');
