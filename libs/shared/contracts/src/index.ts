// Single source of truth for cross-app data shapes. Every schema here is
// consumed by the API (request validation via nestjs-zod + response typing)
// and by the storefront/admin/mobile apps (form validation + TS types via
// z.infer) — change a shape once, everyone using it is type-checked against
// the new version.
export * from './lib/common.schema';
export * from './lib/user.schema';
export * from './lib/auth.schema';
export * from './lib/category.schema';
export * from './lib/product.schema';
export * from './lib/cart.schema';
export * from './lib/order.schema';
export * from './lib/upload.schema';
