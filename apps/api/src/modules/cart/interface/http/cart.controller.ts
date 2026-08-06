import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser, type AuthenticatedUser } from '../../../../common/decorators/current-user.decorator';
import { AddCartItemCommand } from '../../application/commands/add-cart-item.command';
import { UpdateCartItemCommand } from '../../application/commands/update-cart-item.command';
import { ClearCartCommand } from '../../application/commands/clear-cart.command';
import { GetCartQuery } from '../../application/queries/get-cart.query';
import { CartMapper } from './mappers/cart.mapper';
import { AddCartItemRequestDto, UpdateCartItemRequestDto } from './request/cart.request';

/** Every route here requires auth (no @Public()) — the cart always belongs
 *  to the caller, identified from the access token, never from the URL. */
@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async get(@CurrentUser() user: AuthenticatedUser) {
    const cart = await this.queryBus.execute(new GetCartQuery(user.id));
    return CartMapper.toResponse(cart);
  }

  @Post('items')
  async addItem(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddCartItemRequestDto) {
    const cart = await this.commandBus.execute(
      new AddCartItemCommand(user.id, dto.productVariantId, dto.quantity),
    );
    return CartMapper.toResponse(cart);
  }

  @Patch('items/:itemId')
  async updateItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemRequestDto,
  ) {
    const cart = await this.commandBus.execute(new UpdateCartItemCommand(user.id, itemId, dto.quantity));
    return CartMapper.toResponse(cart);
  }

  @Delete()
  async clear(@CurrentUser() user: AuthenticatedUser) {
    const cart = await this.commandBus.execute(new ClearCartCommand(user.id));
    return CartMapper.toResponse(cart);
  }
}
