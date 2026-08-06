import { describe, expect, it } from 'vitest';
import { CreateProductRequestSchema, ListProductsQuerySchema } from './product.schema';

describe('CreateProductRequestSchema', () => {
  const validPayload = {
    name: 'Tailored Emerald Blazer',
    slug: 'tailored-emerald-blazer',
    description: 'A single-breasted wool-blend blazer.',
    basePriceCents: 45000,
    categoryId: '123e4567-e89b-12d3-a456-426614174000',
    variants: [{ sku: 'BLZ-EMR-M', attributes: { size: 'M' }, priceCents: 45000, inventoryQty: 10 }],
  };

  it('accepts a valid product with at least one variant', () => {
    expect(CreateProductRequestSchema.safeParse(validPayload).success).toBe(true);
  });

  it('defaults status to DRAFT and imageUrls to an empty array', () => {
    const result = CreateProductRequestSchema.parse(validPayload);
    expect(result.status).toBe('DRAFT');
    expect(result.imageUrls).toEqual([]);
  });

  it('rejects a slug with uppercase or spaces', () => {
    const result = CreateProductRequestSchema.safeParse({ ...validPayload, slug: 'Not A Slug' });
    expect(result.success).toBe(false);
  });

  it('rejects a product with zero variants', () => {
    const result = CreateProductRequestSchema.safeParse({ ...validPayload, variants: [] });
    expect(result.success).toBe(false);
  });
});

describe('ListProductsQuerySchema', () => {
  it('coerces page/pageSize from query-string strings and applies defaults', () => {
    const result = ListProductsQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it('coerces string query params to numbers', () => {
    const result = ListProductsQuerySchema.parse({ page: '3', pageSize: '10' });
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(10);
  });
});
