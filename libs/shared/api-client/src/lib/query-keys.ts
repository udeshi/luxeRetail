import type { ListOrdersQuery, ListProductsQuery } from '@org/contracts';

/** Centralized so cache keys can't drift between the hook that fetches
 *  data and the mutation that invalidates it. */
export const queryKeys = {
  me: ['auth', 'me'] as const,
  categories: ['categories'] as const,
  products: (query: Partial<ListProductsQuery>) => ['products', query] as const,
  product: (slug: string) => ['products', slug] as const,
  cart: ['cart'] as const,
  myOrders: (query: Partial<ListOrdersQuery>) => ['orders', 'mine', query] as const,
  order: (id: string) => ['orders', id] as const,
  adminProducts: (query: Partial<ListProductsQuery>) => ['admin', 'products', query] as const,
  adminOrders: (query: Partial<ListOrdersQuery>) => ['admin', 'orders', query] as const,
};
