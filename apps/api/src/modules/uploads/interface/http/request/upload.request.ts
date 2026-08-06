import { createZodDto } from 'nestjs-zod';
import { CreatePresignedUploadRequestSchema } from '@org/contracts';

export class CreatePresignedUploadRequestDto extends createZodDto(CreatePresignedUploadRequestSchema) {}
