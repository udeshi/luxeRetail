import type { Category } from '@org/contracts';
import type { CategoryEntity } from '../../../domain/category.entity';

export class CategoryMapper {
  static toResponse(category: CategoryEntity): Category {
    return category;
  }
}
