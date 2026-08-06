import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, type Product as PrismaProduct, type ProductImage, type ProductVariant } from '../../../generated/prisma/client';
import type {
  CreateProductInput,
  ListProductsFilter,
  ListProductsResult,
  ProductRepository,
  UpdateProductInput,
} from '../domain/product.repository';
import type { ProductEntity } from '../domain/product.entity';

type ProductRow = PrismaProduct & { images: ProductImage[]; variants: ProductVariant[] };

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(filter: ListProductsFilter): Promise<ListProductsResult> {
    const where: Prisma.ProductWhereInput = {};
    if (filter.status) where.status = filter.status;
    if (filter.categorySlug) where.category = { slug: filter.categorySlug };
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    if (filter.minPriceCents !== undefined || filter.maxPriceCents !== undefined) {
      where.basePriceCents = {
        ...(filter.minPriceCents !== undefined && { gte: filter.minPriceCents }),
        ...(filter.maxPriceCents !== undefined && { lte: filter.maxPriceCents }),
      };
    }

    const [rows, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { images: { orderBy: { position: 'asc' }, take: 1 } },
        orderBy: { createdAt: 'desc' },
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      total,
      items: rows.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        basePriceCents: p.basePriceCents,
        currency: p.currency,
        status: p.status,
        categoryId: p.categoryId,
        thumbnailUrl: p.images[0]?.url ?? null,
      })),
    };
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { images: { orderBy: { position: 'asc' } }, variants: true },
    });
    return product ? toEntity(product) : null;
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: 'asc' } }, variants: true },
    });
    return product ? toEntity(product) : null;
  }

  async create(input: CreateProductInput): Promise<ProductEntity> {
    const product = await this.prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        basePriceCents: input.basePriceCents,
        categoryId: input.categoryId,
        status: input.status,
        images: { create: input.imageUrls.map((url, position) => ({ url, position })) },
        variants: { create: input.variants },
      },
      include: { images: { orderBy: { position: 'asc' } }, variants: true },
    });
    return toEntity(product);
  }

  async update(id: string, input: UpdateProductInput): Promise<ProductEntity> {
    const data: Prisma.ProductUpdateInput = {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.basePriceCents !== undefined && { basePriceCents: input.basePriceCents }),
      ...(input.categoryId !== undefined && { category: { connect: { id: input.categoryId } } }),
      ...(input.status !== undefined && { status: input.status }),
    };
    // Simplification for this portfolio slice: images/variants are fully
    // replaced rather than diffed. A production admin would PATCH
    // individual variants (they can be tied to existing order history).
    if (input.imageUrls) {
      data.images = { deleteMany: {}, create: input.imageUrls.map((url, position) => ({ url, position })) };
    }
    if (input.variants) {
      data.variants = { deleteMany: {}, create: input.variants };
    }

    const product = await this.prisma.product.update({
      where: { id },
      data,
      include: { images: { orderBy: { position: 'asc' } }, variants: true },
    });
    return toEntity(product);
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.product.delete({ where: { id } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new ConflictException('Cannot delete a product that has existing cart or order history — archive it instead');
      }
      throw err;
    }
  }
}

function toEntity(product: ProductRow): ProductEntity {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePriceCents: product.basePriceCents,
    currency: product.currency,
    status: product.status,
    categoryId: product.categoryId,
    createdAt: product.createdAt,
    images: product.images.map((i) => ({ id: i.id, url: i.url, altText: i.altText, position: i.position })),
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      attributes: v.attributes as Record<string, string>,
      priceCents: v.priceCents,
      inventoryQty: v.inventoryQty,
    })),
  };
}
