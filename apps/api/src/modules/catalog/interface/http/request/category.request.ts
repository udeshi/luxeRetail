import { createZodDto } from 'nestjs-zod';
import { CreateCategoryRequestSchema } from '@org/contracts';

export class CreateCategoryRequestDto extends createZodDto(CreateCategoryRequestSchema) {}
