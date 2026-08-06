import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductsController } from './interface/http/products.controller';
import { CategoriesController } from './interface/http/categories.controller';
import { PRODUCT_REPOSITORY } from './domain/product.repository';
import { CATEGORY_REPOSITORY } from './domain/category.repository';
import { PrismaProductRepository } from './infrastructure/prisma-product.repository';
import { PrismaCategoryRepository } from './infrastructure/prisma-category.repository';
import { CreateProductHandler } from './application/commands/create-product.command';
import { UpdateProductHandler } from './application/commands/update-product.command';
import { DeleteProductHandler } from './application/commands/delete-product.command';
import { CreateCategoryHandler } from './application/commands/create-category.command';
import { ListProductsHandler } from './application/queries/list-products.query';
import { GetProductBySlugHandler } from './application/queries/get-product-by-slug.query';
import { GetProductByIdHandler } from './application/queries/get-product-by-id.query';
import { ListCategoriesHandler } from './application/queries/list-categories.query';

const commandHandlers = [CreateProductHandler, UpdateProductHandler, DeleteProductHandler, CreateCategoryHandler];
const queryHandlers = [ListProductsHandler, GetProductBySlugHandler, GetProductByIdHandler, ListCategoriesHandler];

@Module({
  imports: [CqrsModule],
  controllers: [ProductsController, CategoriesController],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
    { provide: CATEGORY_REPOSITORY, useClass: PrismaCategoryRepository },
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class CatalogModule {}
