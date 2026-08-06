import { z } from 'zod';

export const RoleSchema = z.enum(['CUSTOMER', 'ADMIN']);
export type Role = z.infer<typeof RoleSchema>;

/** Public shape of a user — password hash never leaves the API. */
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: RoleSchema,
  createdAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

export const AddressSchema = z.object({
  id: z.string().uuid(),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().length(2),
  phone: z.string().optional(),
  isDefault: z.boolean(),
});
export type Address = z.infer<typeof AddressSchema>;

/** Input shape for creating/updating an address — no id, server assigns it. */
export const AddressInputSchema = AddressSchema.omit({ id: true, isDefault: true }).extend({
  isDefault: z.boolean().optional(),
});
export type AddressInput = z.infer<typeof AddressInputSchema>;
