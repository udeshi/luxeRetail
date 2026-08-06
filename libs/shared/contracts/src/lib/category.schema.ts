import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().uuid().nullable(),
});
export type Category = z.infer<typeof CategorySchema>;

export const CreateCategoryRequestSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase, alphanumeric, and hyphen-separated'),
  parentId: z.string().uuid().optional(),
});
export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequestSchema>;
