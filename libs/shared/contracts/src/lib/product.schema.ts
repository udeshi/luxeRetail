import { z } from 'zod';
import { PaginationQuerySchema } from './common.schema';

export const ProductStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);
export type ProductStatus = z.infer<typeof ProductStatusSchema>;

export const ProductVariantSchema = z.object({
  id: z.string().uuid(),
  sku: z.string().min(1),
  attributes: z.record(z.string(), z.string()),
  priceCents: z.number().int().nonnegative(),
  inventoryQty: z.number().int().nonnegative(),
});
export type ProductVariant = z.infer<typeof ProductVariantSchema>;

export const ProductImageSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  altText: z.string().optional(),
  position: z.number().int(),
});
export type ProductImage = z.infer<typeof ProductImageSchema>;

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  basePriceCents: z.number().int().nonnegative(),
  currency: z.string().length(3),
  status: ProductStatusSchema,
  categoryId: z.string().uuid(),
  images: z.array(ProductImageSchema),
  variants: z.array(ProductVariantSchema),
  createdAt: z.coerce.date(),
});
export type Product = z.infer<typeof ProductSchema>;

/** Lighter shape for list/grid views — avoids shipping every variant. */
export const ProductSummarySchema = ProductSchema.pick({
  id: true,
  name: true,
  slug: true,
  basePriceCents: true,
  currency: true,
  status: true,
  categoryId: true,
}).extend({
  thumbnailUrl: z.string().url().nullable(),
});
export type ProductSummary = z.infer<typeof ProductSummarySchema>;

export const ListProductsQuerySchema = PaginationQuerySchema.extend({
  categorySlug: z.string().optional(),
  search: z.string().optional(),
  minPriceCents: z.coerce.number().int().nonnegative().optional(),
  maxPriceCents: z.coerce.number().int().nonnegative().optional(),
  // Storefront only ever sees ACTIVE products; admin can filter by any status.
  status: ProductStatusSchema.optional(),
});
export type ListProductsQuery = z.infer<typeof ListProductsQuerySchema>;

const VariantInputSchema = z.object({
  sku: z.string().min(1),
  attributes: z.record(z.string(), z.string()),
  priceCents: z.number().int().nonnegative(),
  inventoryQty: z.number().int().nonnegative(),
});

// Bare field schemas with no `.default()` — shared by both the create and
// update schemas below. `.default()` has to be layered on *after* `.partial()`
// would run, not before: Zod's `.partial()` only allows a field to be
// *absent*, it doesn't strip that field's own default, so
// `CreateProductRequestSchema.partial()` would silently resurrect
// `status`/`imageUrls` (via their defaults) on every partial PATCH that
// omits them — overwriting whatever the product already had.
const ProductFieldsSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase, alphanumeric, and hyphen-separated'),
  description: z.string().min(1),
  basePriceCents: z.number().int().nonnegative(),
  categoryId: z.string().uuid(),
  status: ProductStatusSchema,
  imageUrls: z.array(z.string().url()),
  variants: z.array(VariantInputSchema).min(1, 'At least one variant is required'),
});

export const CreateProductRequestSchema = ProductFieldsSchema.extend({
  status: ProductStatusSchema.default('DRAFT'),
  imageUrls: z.array(z.string().url()).default([]),
});
export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;

export const UpdateProductRequestSchema = ProductFieldsSchema.partial();
export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>;
