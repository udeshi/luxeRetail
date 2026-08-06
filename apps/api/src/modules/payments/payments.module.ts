import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { StripeWebhookController } from './interface/http/stripe-webhook.controller';
import { PAYMENT_GATEWAY } from './domain/payment-gateway.port';
import { PAYMENT_REPOSITORY } from './domain/payment.repository';
import { StripePaymentGateway } from './infrastructure/stripe-payment-gateway';
import { PrismaPaymentRepository } from './infrastructure/prisma-payment.repository';

@Module({
  imports: [CqrsModule],
  controllers: [StripeWebhookController],
  providers: [
    { provide: PAYMENT_GATEWAY, useClass: StripePaymentGateway },
    { provide: PAYMENT_REPOSITORY, useClass: PrismaPaymentRepository },
  ],
  exports: [PAYMENT_GATEWAY, PAYMENT_REPOSITORY],
})
export class PaymentsModule {}
