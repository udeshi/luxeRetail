import type { ProductEntity, ProductSummaryEntity, ProductStatus } from './product.entity';

export interface ListProductsFilter {
  page: number;
  pageSize: number;
  categorySlug?: string;
  search?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  status?: ProductStatus;
}

export interface ListProductsResult {
  items: ProductSummaryEntity[];
  total: number;
}

export interface CreateProductInput {
  name: string;
  slug: string;
  description: string;
  basePriceCents: number;
  categoryId: string;
  status: ProductStatus;
  imageUrls: string[];
  variants: { sku: string; attributes: Record<string, string>; priceCents: number; inventoryQty: number }[];
}

export type UpdateProductInput = Partial<CreateProductInput>;

/** Port. */
export interface ProductRepository {
  findMany(filter: ListProductsFilter): Promise<ListProductsResult>;
  findBySlug(slug: string): Promise<ProductEntity | null>;
  findById(id: string): Promise<ProductEntity | null>;
  create(input: CreateProductInput): Promise<ProductEntity>;
  update(id: string, input: UpdateProductInput): Promise<ProductEntity>;
  delete(id: string): Promise<void>;
}

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
