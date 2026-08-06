import type { Product, ProductSummary } from '@org/contracts';
import type { ProductEntity, ProductSummaryEntity } from '../../../domain/product.entity';
import type { ListProductsResult } from '../../../domain/product.repository';

export class ProductMapper {
  static toResponse(product: ProductEntity): Product {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      basePriceCents: product.basePriceCents,
      currency: product.currency,
      status: product.status,
      categoryId: product.categoryId,
      images: product.images.map((image) => ({ ...image, altText: image.altText ?? undefined })),
      variants: product.variants,
      createdAt: product.createdAt,
    };
  }

  static toSummaryResponse(product: ProductSummaryEntity): ProductSummary {
    return { ...product };
  }

  static toListResponse(result: ListProductsResult, page: number, pageSize: number) {
    return {
      items: result.items.map(ProductMapper.toSummaryResponse),
      page,
      pageSize,
      total: result.total,
      totalPages: Math.max(1, Math.ceil(result.total / pageSize)),
    };
  }
}
