import { useMutation } from '@tanstack/react-query';
import type { CreatePresignedUploadRequest, PresignedUploadResponse } from '@org/contracts';
import { apiFetch } from './http-client';

export const uploadsApi = {
  presign: (input: CreatePresignedUploadRequest) =>
    apiFetch<PresignedUploadResponse>('/admin/uploads/presign', { method: 'POST', body: input }),
};

/** Presigns a URL, then PUTs the file straight to object storage — the API
 *  never sees the file bytes. Returns the public URL to save on the product. */
export function useUploadProductImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const { uploadUrl, publicUrl } = await uploadsApi.presign({
        fileName: file.name,
        contentType: file.type as CreatePresignedUploadRequest['contentType'],
      });
      const response = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      if (!response.ok) throw new Error('Image upload failed');
      return publicUrl;
    },
  });
}
