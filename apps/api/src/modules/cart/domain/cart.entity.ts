export interface CartItemEntity {
  id: string;
  productVariantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  thumbnailUrl: string | null;
  variantAttributes: Record<string, string>;
  quantity: number;
  unitPriceCents: number;
}

export interface CartEntity {
  id: string;
  items: CartItemEntity[];
  subtotalCents: number;
  currency: string;
}
