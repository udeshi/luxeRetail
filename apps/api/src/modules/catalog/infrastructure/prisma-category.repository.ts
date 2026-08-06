import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { CategoryRepository } from '../domain/category.repository';
import type { CategoryEntity } from '../domain/category.entity';

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CategoryEntity[]> {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    return this.prisma.category.findUnique({ where: { slug } });
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async create(input: { name: string; slug: string; parentId?: string }): Promise<CategoryEntity> {
    return this.prisma.category.create({ data: input });
  }
}
