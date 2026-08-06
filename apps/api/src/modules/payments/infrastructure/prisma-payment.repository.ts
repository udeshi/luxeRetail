import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { PaymentEntity, PaymentRepository, PaymentStatus } from '../domain/payment.repository';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    orderId: string;
    providerPaymentId: string;
    amountCents: number;
    currency: string;
  }): Promise<PaymentEntity> {
    const payment = await this.prisma.payment.create({
      data: {
        orderId: input.orderId,
        stripePaymentIntentId: input.providerPaymentId,
        amountCents: input.amountCents,
        currency: input.currency,
      },
    });
    return toEntity(payment);
  }

  async updateStatusByProviderId(providerPaymentId: string, status: PaymentStatus): Promise<PaymentEntity | null> {
    const payment = await this.prisma.payment.update({
      where: { stripePaymentIntentId: providerPaymentId },
      data: { status },
    });
    return payment ? toEntity(payment) : null;
  }
}

function toEntity(payment: {
  id: string;
  orderId: string;
  stripePaymentIntentId: string;
  status: PaymentStatus;
  amountCents: number;
  currency: string;
}): PaymentEntity {
  return {
    id: payment.id,
    orderId: payment.orderId,
    providerPaymentId: payment.stripePaymentIntentId,
    status: payment.status,
    amountCents: payment.amountCents,
    currency: payment.currency,
  };
}
