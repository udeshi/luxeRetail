import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PRODUCT_REPOSITORY, type ProductRepository } from '../../domain/product.repository';

export class DeleteProductCommand {
  constructor(public readonly productId: string) {}
}

@Injectable()
@CommandHandler(DeleteProductCommand)
export class DeleteProductHandler implements ICommandHandler<DeleteProductCommand, void> {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository) {}

  async execute(command: DeleteProductCommand): Promise<void> {
    const existing = await this.products.findById(command.productId);
    if (!existing) throw new NotFoundException('Product not found');
    await this.products.delete(command.productId);
  }
}
