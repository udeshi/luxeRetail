/** Port around object storage. MinIO locally, S3/R2 in prod — the admin
 *  app always talks directly to whichever one this resolves to, the API
 *  only ever hands out a scoped, time-limited URL. */
export interface StoragePort {
  createPresignedUploadUrl(input: { key: string; contentType: string }): Promise<{
    uploadUrl: string;
    publicUrl: string;
  }>;
}

export const STORAGE_PORT = Symbol('STORAGE_PORT');
