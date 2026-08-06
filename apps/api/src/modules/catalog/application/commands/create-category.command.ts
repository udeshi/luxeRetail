import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CATEGORY_REPOSITORY, type CategoryRepository } from '../../domain/category.repository';
import type { CategoryEntity } from '../../domain/category.entity';

export class CreateCategoryCommand {
  constructor(
    public readonly name: string,
    public readonly slug: string,
    public readonly parentId?: string,
  ) {}
}

@Injectable()
@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand, CategoryEntity> {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly categories: CategoryRepository) {}

  async execute(command: CreateCategoryCommand): Promise<CategoryEntity> {
    const existing = await this.categories.findBySlug(command.slug);
    if (existing) throw new ConflictException('A category with this slug already exists');
    return this.categories.create({ name: command.name, slug: command.slug, parentId: command.parentId });
  }
}
