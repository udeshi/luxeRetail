import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PRODUCT_REPOSITORY, type CreateProductInput, type ProductRepository } from '../../domain/product.repository';
import type { ProductEntity } from '../../domain/product.entity';

export class CreateProductCommand {
  constructor(public readonly input: CreateProductInput) {}
}

@Injectable()
@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand, ProductEntity> {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository) {}

  execute(command: CreateProductCommand): Promise<ProductEntity> {
    return this.products.create(command.input);
  }
}
