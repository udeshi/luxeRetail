import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PRODUCT_REPOSITORY, type ProductRepository, type UpdateProductInput } from '../../domain/product.repository';
import type { ProductEntity } from '../../domain/product.entity';

export class UpdateProductCommand {
  constructor(
    public readonly productId: string,
    public readonly input: UpdateProductInput,
  ) {}
}

@Injectable()
@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler implements ICommandHandler<UpdateProductCommand, ProductEntity> {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository) {}

  async execute(command: UpdateProductCommand): Promise<ProductEntity> {
    const existing = await this.products.findById(command.productId);
    if (!existing) throw new NotFoundException('Product not found');
    return this.products.update(command.productId, command.input);
  }
}
