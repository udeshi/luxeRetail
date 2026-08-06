import type { OrderEntity, OrderSummaryEntity, OrderStatus, ShippingAddress } from './order.entity';

export interface CreateOrderInput {
  userId: string;
  items: {
    productVariantId: string;
    productName: string;
    variantAttributes: Record<string, string>;
    quantity: number;
    unitPriceCents: number;
  }[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  shippingAddress: ShippingAddress;
}

export interface ListOrdersFilter {
  page: number;
  pageSize: number;
  status?: OrderStatus;
}

export interface ListOrdersResult {
  items: OrderSummaryEntity[];
  total: number;
}

/** Port. */
export interface OrderRepository {
  create(input: CreateOrderInput): Promise<OrderEntity>;
  attachPaymentIntent(orderId: string, stripePaymentIntentId: string): Promise<void>;
  findById(id: string): Promise<OrderEntity | null>;
  findByStripePaymentIntentId(stripePaymentIntentId: string): Promise<OrderEntity | null>;
  findManyForUser(userId: string, filter: ListOrdersFilter): Promise<ListOrdersResult>;
  findManyAdmin(filter: ListOrdersFilter): Promise<ListOrdersResult>;
  updateStatus(id: string, status: OrderStatus): Promise<OrderEntity>;
}

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');
