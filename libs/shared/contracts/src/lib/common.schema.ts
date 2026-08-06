import { z } from 'zod';

/**
 * Money is always transported as integer cents + an ISO 4217 currency code —
 * never a float. `MoneySchema` documents that contract everywhere it's used
 * (product prices, cart totals, order totals) instead of every DTO
 * reinventing it slightly differently.
 */
export const MoneySchema = z.object({
  amountCents: z.number().int().nonnegative(),
  currency: z.string().length(3).default('usd'),
});
export type Money = z.infer<typeof MoneySchema>;

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const paginatedResponseSchema = <ItemSchema extends z.ZodTypeAny>(itemSchema: ItemSchema) =>
  z.object({
    items: z.array(itemSchema),
    page: z.number().int(),
    pageSize: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  });
export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
