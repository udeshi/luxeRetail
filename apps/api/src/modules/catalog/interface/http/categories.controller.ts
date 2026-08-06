import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Public } from '../../../../common/decorators/public.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ListCategoriesQuery } from '../../application/queries/list-categories.query';
import { CreateCategoryCommand } from '../../application/commands/create-category.command';
import { CategoryMapper } from './mappers/category.mapper';
import { CreateCategoryRequestDto } from './request/category.request';

@ApiTags('catalog')
@Controller()
export class CategoriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Get('categories')
  async list() {
    const categories = await this.queryBus.execute(new ListCategoriesQuery());
    return categories.map(CategoryMapper.toResponse);
  }

  @Roles('ADMIN')
  @Post('admin/categories')
  async create(@Body() dto: CreateCategoryRequestDto) {
    const category = await this.commandBus.execute(new CreateCategoryCommand(dto.name, dto.slug, dto.parentId));
    return CategoryMapper.toResponse(category);
  }
}
