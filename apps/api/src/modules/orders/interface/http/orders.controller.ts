import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser, type AuthenticatedUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CreateOrderCommand, type CreateOrderResult } from '../../application/commands/create-order.command';
import { UpdateOrderStatusCommand } from '../../application/commands/update-order-status.command';
import { ListMyOrdersQuery } from '../../application/queries/list-my-orders.query';
import { ListAllOrdersQuery } from '../../application/queries/list-all-orders.query';
import { GetOrderQuery } from '../../application/queries/get-order.query';
import { OrderMapper } from './mappers/order.mapper';
import { CreateOrderRequestDto, ListOrdersQueryDto, UpdateOrderStatusRequestDto } from './request/order.request';
import type { OrderEntity } from '../../domain/order.entity';

@ApiTags('orders')
@Controller()
export class OrdersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /** Starts checkout: creates a PENDING order + Stripe PaymentIntent from
   *  the caller's current cart, and empties the cart. */
  @Post('orders')
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateOrderRequestDto) {
    const result = await this.commandBus.execute<CreateOrderCommand, CreateOrderResult>(
      new CreateOrderCommand(user.id, dto.shippingAddress),
    );
    return OrderMapper.toCreateResponse(result);
  }

  @Get('orders')
  async listMine(@CurrentUser() user: AuthenticatedUser, @Query() query: ListOrdersQueryDto) {
    const result = await this.queryBus.execute(new ListMyOrdersQuery(user.id, query));
    return OrderMapper.toListResponse(result, query.page, query.pageSize);
  }

  @Get('orders/:id')
  async getOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const order = await this.queryBus.execute<GetOrderQuery, OrderEntity>(new GetOrderQuery(id, user));
    return OrderMapper.toResponse(order);
  }

  @Roles('ADMIN')
  @Get('admin/orders')
  async adminList(@Query() query: ListOrdersQueryDto) {
    const result = await this.queryBus.execute(new ListAllOrdersQuery(query));
    return OrderMapper.toListResponse(result, query.page, query.pageSize);
  }

  @Roles('ADMIN')
  @Patch('admin/orders/:id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusRequestDto) {
    const order = await this.commandBus.execute<UpdateOrderStatusCommand, OrderEntity>(
      new UpdateOrderStatusCommand(id, dto.status),
    );
    return OrderMapper.toResponse(order);
  }
}
