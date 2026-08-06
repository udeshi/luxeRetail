import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Public } from '../../../../common/decorators/public.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CreateProductCommand } from '../../application/commands/create-product.command';
import { UpdateProductCommand } from '../../application/commands/update-product.command';
import { DeleteProductCommand } from '../../application/commands/delete-product.command';
import { ListProductsQuery } from '../../application/queries/list-products.query';
import { GetProductBySlugQuery } from '../../application/queries/get-product-by-slug.query';
import { GetProductByIdQuery } from '../../application/queries/get-product-by-id.query';
import { ProductMapper } from './mappers/product.mapper';
import { CreateProductRequestDto, ListProductsQueryDto, UpdateProductRequestDto } from './request/product.request';
import type { ProductEntity } from '../../domain/product.entity';

/**
 * Public browsing (`/products`) and admin CRUD (`/admin/products`) share one
 * controller because they're the same aggregate — but every admin route is
 * still gated by @Roles('ADMIN'), so the split is purely about routing, not
 * about who's allowed to call what.
 */
@ApiTags('catalog')
@Controller()
export class ProductsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Get('products')
  async list(@Query() query: ListProductsQueryDto) {
    // The public endpoint can only ever see ACTIVE products, regardless of
    // what a caller passes — draft/archived stock is an admin-only concern.
    const result = await this.queryBus.execute(
      new ListProductsQuery({ ...query, status: 'ACTIVE' }),
    );
    return ProductMapper.toListResponse(result, query.page, query.pageSize);
  }

  @Public()
  @Get('products/:slug')
  async getBySlug(@Param('slug') slug: string) {
    const product = await this.queryBus.execute<GetProductBySlugQuery, ProductEntity>(
      new GetProductBySlugQuery(slug),
    );
    if (product.status !== 'ACTIVE') throw new NotFoundException('Product not found');
    return ProductMapper.toResponse(product);
  }

  @Roles('ADMIN')
  @Get('admin/products')
  async adminList(@Query() query: ListProductsQueryDto) {
    const result = await this.queryBus.execute(new ListProductsQuery(query));
    return ProductMapper.toListResponse(result, query.page, query.pageSize);
  }

  @Roles('ADMIN')
  @Get('admin/products/:id')
  async adminGetById(@Param('id') id: string) {
    const product = await this.queryBus.execute<GetProductByIdQuery, ProductEntity>(new GetProductByIdQuery(id));
    return ProductMapper.toResponse(product);
  }

  @Roles('ADMIN')
  @Post('admin/products')
  async create(@Body() dto: CreateProductRequestDto) {
    const product = await this.commandBus.execute<CreateProductCommand, ProductEntity>(
      new CreateProductCommand(dto),
    );
    return ProductMapper.toResponse(product);
  }

  @Roles('ADMIN')
  @Patch('admin/products/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductRequestDto) {
    const product = await this.commandBus.execute<UpdateProductCommand, ProductEntity>(
      new UpdateProductCommand(id, dto),
    );
    return ProductMapper.toResponse(product);
  }

  @Roles('ADMIN')
  @HttpCode(204)
  @Delete('admin/products/:id')
  async remove(@Param('id') id: string) {
    await this.commandBus.execute(new DeleteProductCommand(id));
  }
}
