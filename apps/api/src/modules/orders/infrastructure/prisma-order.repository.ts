import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import type {
  CreateOrderInput,
  ListOrdersFilter,
  ListOrdersResult,
  OrderRepository,
} from '../domain/order.repository';
import type { OrderEntity, OrderStatus, ShippingAddress } from '../domain/order.entity';

const orderInclude = { items: true } satisfies Prisma.OrderInclude;
type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateOrderInput): Promise<OrderEntity> {
    const order = await this.prisma.order.create({
      data: {
        userId: input.userId,
        subtotalCents: input.subtotalCents,
        shippingCents: input.shippingCents,
        totalCents: input.totalCents,
        currency: input.currency,
        shippingAddress: input.shippingAddress as unknown as Prisma.InputJsonValue,
        items: {
          create: input.items.map((item) => ({
            productVariantId: item.productVariantId,
            productName: item.productName,
            variantAttributes: item.variantAttributes as unknown as Prisma.InputJsonValue,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
          })),
        },
      },
      include: orderInclude,
    });
    return toEntity(order);
  }

  async attachPaymentIntent(orderId: string, stripePaymentIntentId: string): Promise<void> {
    await this.prisma.order.update({ where: { id: orderId }, data: { stripePaymentIntentId } });
  }

  async findById(id: string): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findUnique({ where: { id }, include: orderInclude });
    return order ? toEntity(order) : null;
  }

  async findByStripePaymentIntentId(stripePaymentIntentId: string): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findUnique({ where: { stripePaymentIntentId }, include: orderInclude });
    return order ? toEntity(order) : null;
  }

  findManyForUser(userId: string, filter: ListOrdersFilter): Promise<ListOrdersResult> {
    return this.findMany({ userId, ...(filter.status && { status: filter.status }) }, filter);
  }

  findManyAdmin(filter: ListOrdersFilter): Promise<ListOrdersResult> {
    return this.findMany(filter.status ? { status: filter.status } : {}, filter);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderEntity> {
    const order = await this.prisma.order.update({ where: { id }, data: { status }, include: orderInclude });
    return toEntity(order);
  }

  private async findMany(
    where: Prisma.OrderWhereInput,
    filter: ListOrdersFilter,
  ): Promise<ListOrdersResult> {
    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);
    return {
      total,
      items: rows.map((o) => ({
        id: o.id,
        status: o.status,
        totalCents: o.totalCents,
        currency: o.currency,
        createdAt: o.createdAt,
        itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
      })),
    };
  }
}

function toEntity(order: OrderRow): OrderEntity {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    totalCents: order.totalCents,
    currency: order.currency,
    stripePaymentIntentId: order.stripePaymentIntentId,
    shippingAddress: order.shippingAddress as unknown as ShippingAddress,
    createdAt: order.createdAt,
    items: order.items.map((i) => ({
      id: i.id,
      productVariantId: i.productVariantId,
      productName: i.productName,
      variantAttributes: i.variantAttributes as Record<string, string>,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
    })),
  };
}
