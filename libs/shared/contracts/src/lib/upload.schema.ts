import { z } from 'zod';

/** Admin asks the API for a presigned URL, then PUTs the file directly to
 *  object storage — the API never sees the file bytes. */
export const CreatePresignedUploadRequestSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.enum(['image/png', 'image/jpeg', 'image/webp']),
});
export type CreatePresignedUploadRequest = z.infer<typeof CreatePresignedUploadRequestSchema>;

export const PresignedUploadResponseSchema = z.object({
  uploadUrl: z.string().url(), // PUT the file here
  publicUrl: z.string().url(), // store this on the product once the PUT succeeds
});
export type PresignedUploadResponse = z.infer<typeof PresignedUploadResponseSchema>;
