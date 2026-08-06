export type OrderStatus = 'PENDING' | 'PAID' | 'FULFILLED' | 'CANCELLED';

export interface OrderItemEntity {
  id: string;
  productVariantId: string;
  productName: string;
  variantAttributes: Record<string, string>;
  quantity: number;
  unitPriceCents: number;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderEntity {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItemEntity[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  stripePaymentIntentId: string | null;
  shippingAddress: ShippingAddress;
  createdAt: Date;
}

export interface OrderSummaryEntity {
  id: string;
  status: OrderStatus;
  totalCents: number;
  currency: string;
  createdAt: Date;
  itemCount: number;
}
