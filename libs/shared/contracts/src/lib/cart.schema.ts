import { z } from 'zod';

export const CartItemSchema = z.object({
  id: z.string().uuid(),
  productVariantId: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string(),
  productSlug: z.string(),
  thumbnailUrl: z.string().url().nullable(),
  variantAttributes: z.record(z.string(), z.string()),
  quantity: z.number().int().positive(),
  unitPriceCents: z.number().int().nonnegative(),
});
export type CartItem = z.infer<typeof CartItemSchema>;

export const CartSchema = z.object({
  id: z.string().uuid(),
  items: z.array(CartItemSchema),
  subtotalCents: z.number().int().nonnegative(),
  currency: z.string().length(3),
});
export type Cart = z.infer<typeof CartSchema>;

export const AddCartItemRequestSchema = z.object({
  productVariantId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});
export type AddCartItemRequest = z.infer<typeof AddCartItemRequestSchema>;

export const UpdateCartItemRequestSchema = z.object({
  quantity: z.number().int().nonnegative(), // 0 removes the item
});
export type UpdateCartItemRequest = z.infer<typeof UpdateCartItemRequestSchema>;
