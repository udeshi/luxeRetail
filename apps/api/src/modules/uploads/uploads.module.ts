import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UploadsController } from './interface/http/uploads.controller';
import { STORAGE_PORT } from './domain/storage.port';
import { S3StorageAdapter } from './infrastructure/s3-storage.adapter';
import { CreatePresignedUploadHandler } from './application/commands/create-presigned-upload.command';

@Module({
  imports: [CqrsModule],
  controllers: [UploadsController],
  providers: [{ provide: STORAGE_PORT, useClass: S3StorageAdapter }, CreatePresignedUploadHandler],
})
export class UploadsModule {}
