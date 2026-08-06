/**
 * The User aggregate as the business layer understands it — deliberately
 * not the Prisma model. Application/interface code depends on this type,
 * never on `@prisma/client` directly, so swapping the persistence layer
 * later only touches infrastructure/.
 */
export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: Date;
}
