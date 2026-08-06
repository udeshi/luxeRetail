import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { STORAGE_PORT, type StoragePort } from '../../domain/storage.port';

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export class CreatePresignedUploadCommand {
  constructor(
    public readonly fileName: string,
    public readonly contentType: string,
  ) {}
}

@Injectable()
@CommandHandler(CreatePresignedUploadCommand)
export class CreatePresignedUploadHandler
  implements ICommandHandler<CreatePresignedUploadCommand, { uploadUrl: string; publicUrl: string }>
{
  constructor(@Inject(STORAGE_PORT) private readonly storage: StoragePort) {}

  execute(command: CreatePresignedUploadCommand) {
    // A random key — never trust the client's file name as a storage path.
    const extension = EXTENSION_BY_CONTENT_TYPE[command.contentType] ?? 'bin';
    const key = `products/${randomUUID()}.${extension}`;
    return this.storage.createPresignedUploadUrl({ key, contentType: command.contentType });
  }
}
