import { createZodDto } from 'nestjs-zod';
import { PresignedUploadResponseSchema } from '@org/contracts';

export class PresignedUploadResponseDto extends createZodDto(PresignedUploadResponseSchema) {}
