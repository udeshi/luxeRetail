import { z } from 'zod';
import { AddressInputSchema } from './user.schema';
import { PaginationQuerySchema } from './common.schema';

export const OrderStatusSchema = z.enum(['PENDING', 'PAID', 'FULFILLED', 'CANCELLED']);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  productVariantId: z.string().uuid(),
  productName: z.string(),
  variantAttributes: z.record(z.string(), z.string()),
  quantity: z.number().int().positive(),
  unitPriceCents: z.number().int().nonnegative(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string().uuid(),
  status: OrderStatusSchema,
  items: z.array(OrderItemSchema),
  subtotalCents: z.number().int().nonnegative(),
  shippingCents: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(),
  currency: z.string().length(3),
  shippingAddress: AddressInputSchema,
  createdAt: z.coerce.date(),
});
export type Order = z.infer<typeof OrderSchema>;

export const OrderSummarySchema = OrderSchema.pick({
  id: true,
  status: true,
  totalCents: true,
  currency: true,
  createdAt: true,
}).extend({ itemCount: z.number().int().nonnegative() });
export type OrderSummary = z.infer<typeof OrderSummarySchema>;

export const ListOrdersQuerySchema = PaginationQuerySchema.extend({
  status: OrderStatusSchema.optional(),
});
export type ListOrdersQuery = z.infer<typeof ListOrdersQuerySchema>;

/** Kicks off checkout: creates a PENDING order + a Stripe PaymentIntent from the caller's current cart. */
export const CreateOrderRequestSchema = z.object({
  shippingAddress: AddressInputSchema,
});
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;

/** Returned by POST /orders — the client confirms this with Stripe.js next. */
export const CreateOrderResponseSchema = z.object({
  order: OrderSchema,
  clientSecret: z.string(),
});
export type CreateOrderResponse = z.infer<typeof CreateOrderResponseSchema>;

export const UpdateOrderStatusRequestSchema = z.object({
  status: OrderStatusSchema,
});
export type UpdateOrderStatusRequest = z.infer<typeof UpdateOrderStatusRequestSchema>;
