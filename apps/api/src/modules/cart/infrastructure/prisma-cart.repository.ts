import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import type { CartRepository } from '../domain/cart.repository';
import type { CartEntity } from '../domain/cart.entity';

const cartInclude = {
  items: {
    include: {
      productVariant: {
        include: { product: { include: { images: { orderBy: { position: 'asc' }, take: 1 } } } },
      },
    },
  },
} satisfies Prisma.CartInclude;
type CartRow = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

@Injectable()
export class PrismaCartRepository implements CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateForUser(userId: string): Promise<CartEntity> {
    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: cartInclude,
    });
    return toEntity(cart);
  }

  async addItem(userId: string, productVariantId: string, quantity: number): Promise<CartEntity> {
    const [cart, variant] = await Promise.all([
      this.ensureCart(userId),
      this.prisma.productVariant.findUniqueOrThrow({ where: { id: productVariantId } }),
    ]);

    await this.prisma.cartItem.upsert({
      where: { cartId_productVariantId: { cartId: cart.id, productVariantId } },
      create: { cartId: cart.id, productVariantId, quantity, unitPriceCents: variant.priceCents },
      update: { quantity: { increment: quantity } },
    });

    return this.getOrCreateForUser(userId);
  }

  async setItemQuantity(userId: string, cartItemId: string, quantity: number): Promise<CartEntity> {
    const item = await this.prisma.cartItem.findUnique({ where: { id: cartItemId }, include: { cart: true } });
    if (!item || item.cart.userId !== userId) throw new NotFoundException('Cart item not found');

    if (quantity === 0) {
      await this.prisma.cartItem.delete({ where: { id: cartItemId } });
    } else {
      await this.prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
    }
    return this.getOrCreateForUser(userId);
  }

  async clear(userId: string): Promise<CartEntity> {
    const cart = await this.ensureCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getOrCreateForUser(userId);
  }

  private ensureCart(userId: string) {
    return this.prisma.cart.upsert({ where: { userId }, create: { userId }, update: {} });
  }
}

function toEntity(cart: CartRow): CartEntity {
  const items = cart.items.map((item) => ({
    id: item.id,
    productVariantId: item.productVariantId,
    productId: item.productVariant.productId,
    productName: item.productVariant.product.name,
    productSlug: item.productVariant.product.slug,
    thumbnailUrl: item.productVariant.product.images[0]?.url ?? null,
    variantAttributes: item.productVariant.attributes as Record<string, string>,
    quantity: item.quantity,
    unitPriceCents: item.unitPriceCents,
  }));

  return {
    id: cart.id,
    items,
    subtotalCents: items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0),
    currency: 'usd',
  };
}
