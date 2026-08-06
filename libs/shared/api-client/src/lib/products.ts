import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateProductRequest,
  ListProductsQuery,
  PaginatedResponse,
  Product,
  ProductSummary,
  UpdateProductRequest,
} from '@org/contracts';
import { apiFetch } from './http-client';
import { queryKeys } from './query-keys';

export const productsApi = {
  list: (query: Partial<ListProductsQuery> = {}) =>
    apiFetch<PaginatedResponse<ProductSummary>>('/products', { query }),
  getBySlug: (slug: string) => apiFetch<Product>(`/products/${slug}`),

  adminList: (query: Partial<ListProductsQuery> = {}) =>
    apiFetch<PaginatedResponse<ProductSummary>>('/admin/products', { query }),
  adminGetById: (id: string) => apiFetch<Product>(`/admin/products/${id}`),
  adminCreate: (input: CreateProductRequest) =>
    apiFetch<Product>('/admin/products', { method: 'POST', body: input }),
  adminUpdate: (id: string, input: UpdateProductRequest) =>
    apiFetch<Product>(`/admin/products/${id}`, { method: 'PATCH', body: input }),
  adminDelete: (id: string) => apiFetch<void>(`/admin/products/${id}`, { method: 'DELETE' }),
};

export function useProducts(query: Partial<ListProductsQuery> = {}) {
  return useQuery({ queryKey: queryKeys.products(query), queryFn: () => productsApi.list(query) });
}

export function useProduct(slug: string) {
  return useQuery({ queryKey: queryKeys.product(slug), queryFn: () => productsApi.getBySlug(slug), enabled: !!slug });
}

export function useAdminProducts(query: Partial<ListProductsQuery> = {}) {
  return useQuery({ queryKey: queryKeys.adminProducts(query), queryFn: () => productsApi.adminList(query) });
}

export function useAdminProduct(id: string) {
  return useQuery({ queryKey: ['admin', 'products', id], queryFn: () => productsApi.adminGetById(id), enabled: !!id });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productsApi.adminCreate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductRequest }) => productsApi.adminUpdate(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productsApi.adminDelete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });
}
