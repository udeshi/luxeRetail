export interface ProductVariantEntity {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  priceCents: number;
  inventoryQty: number;
}

export interface ProductImageEntity {
  id: string;
  url: string;
  altText: string | null;
  position: number;
}

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface ProductEntity {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePriceCents: number;
  currency: string;
  status: ProductStatus;
  categoryId: string;
  images: ProductImageEntity[];
  variants: ProductVariantEntity[];
  createdAt: Date;
}

/** Lighter projection for list/grid views. */
export interface ProductSummaryEntity {
  id: string;
  name: string;
  slug: string;
  basePriceCents: number;
  currency: string;
  status: ProductStatus;
  categoryId: string;
  thumbnailUrl: string | null;
}
