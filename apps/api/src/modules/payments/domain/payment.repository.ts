export type PaymentStatus = 'REQUIRES_PAYMENT' | 'SUCCEEDED' | 'FAILED';

export interface PaymentEntity {
  id: string;
  orderId: string;
  providerPaymentId: string;
  status: PaymentStatus;
  amountCents: number;
  currency: string;
}

export interface PaymentRepository {
  create(input: {
    orderId: string;
    providerPaymentId: string;
    amountCents: number;
    currency: string;
  }): Promise<PaymentEntity>;
  updateStatusByProviderId(providerPaymentId: string, status: PaymentStatus): Promise<PaymentEntity | null>;
}

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');
