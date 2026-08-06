import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CATEGORY_REPOSITORY, type CategoryRepository } from '../../domain/category.repository';
import type { CategoryEntity } from '../../domain/category.entity';

export class ListCategoriesQuery {}

@Injectable()
@QueryHandler(ListCategoriesQuery)
export class ListCategoriesHandler implements IQueryHandler<ListCategoriesQuery, CategoryEntity[]> {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly categories: CategoryRepository) {}

  execute(): Promise<CategoryEntity[]> {
    return this.categories.findAll();
  }
}
