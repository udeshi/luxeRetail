/** Published once a Stripe webhook confirms payment. The notifications
 *  module listens for this to enqueue the confirmation email — orders
 *  doesn't know or care that email exists. */
export class OrderPaidEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
  ) {}
}
