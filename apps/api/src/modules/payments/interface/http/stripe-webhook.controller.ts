import { BadRequestException, Controller, Headers, Inject, Post, Req } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../../../../common/decorators/public.decorator';
import { PAYMENT_GATEWAY, type PaymentGateway } from '../../domain/payment-gateway.port';
import { ConfirmPaymentCommand } from '../../../orders/application/commands/confirm-payment.command';

/**
 * Stripe calls this directly (not a browser), so it's public — trust comes
 * from the signature check in parseWebhookEvent(), not from a JWT. Needs the
 * exact raw request bytes to verify that signature, which is why
 * NestFactory.create is called with `{ rawBody: true }` in main.ts.
 */
@ApiExcludeController()
@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(
    @Inject(PAYMENT_GATEWAY) private readonly paymentGateway: PaymentGateway,
    private readonly commandBus: CommandBus,
  ) {}

  @Public()
  @Post()
  async handle(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature?: string) {
    if (!req.rawBody || !signature) throw new BadRequestException('Missing Stripe signature or body');

    const event = this.paymentGateway.parseWebhookEvent(req.rawBody, signature);

    if (event.type === 'payment_succeeded') {
      await this.commandBus.execute(new ConfirmPaymentCommand(event.providerPaymentId, 'succeeded'));
    } else if (event.type === 'payment_failed') {
      await this.commandBus.execute(new ConfirmPaymentCommand(event.providerPaymentId, 'failed'));
    }

    return { received: true };
  }
}
