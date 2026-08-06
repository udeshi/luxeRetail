import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { TypedConfigService } from '../../../config/config.module';
import type { StoragePort } from '../domain/storage.port';

const PRESIGNED_URL_TTL_SECONDS = 5 * 60;

@Injectable()
export class S3StorageAdapter implements StoragePort {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(config: TypedConfigService) {
    this.bucket = config.get('S3_BUCKET');
    this.publicUrl = config.get('S3_PUBLIC_URL');
    this.client = new S3Client({
      region: config.get('S3_REGION'),
      endpoint: config.get('S3_ENDPOINT'),
      forcePathStyle: config.get('S3_FORCE_PATH_STYLE'),
      credentials: {
        accessKeyId: config.get('S3_ACCESS_KEY_ID'),
        secretAccessKey: config.get('S3_SECRET_ACCESS_KEY'),
      },
    });
  }

  async createPresignedUploadUrl(input: { key: string; contentType: string }) {
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: input.key, ContentType: input.contentType });
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: PRESIGNED_URL_TTL_SECONDS });
    return { uploadUrl, publicUrl: `${this.publicUrl}/${input.key}` };
  }
}
