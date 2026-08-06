import type { CategoryEntity } from './category.entity';

export interface CategoryRepository {
  findAll(): Promise<CategoryEntity[]>;
  findBySlug(slug: string): Promise<CategoryEntity | null>;
  findById(id: string): Promise<CategoryEntity | null>;
  create(input: { name: string; slug: string; parentId?: string }): Promise<CategoryEntity>;
}

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');
