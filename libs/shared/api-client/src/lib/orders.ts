import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  ListOrdersQuery,
  Order,
  OrderStatus,
  OrderSummary,
  PaginatedResponse,
} from '@org/contracts';
import { apiFetch } from './http-client';
import { queryKeys } from './query-keys';

export const ordersApi = {
  create: (input: CreateOrderRequest) => apiFetch<CreateOrderResponse>('/orders', { method: 'POST', body: input }),
  listMine: (query: Partial<ListOrdersQuery> = {}) =>
    apiFetch<PaginatedResponse<OrderSummary>>('/orders', { query }),
  getById: (id: string) => apiFetch<Order>(`/orders/${id}`),

  adminList: (query: Partial<ListOrdersQuery> = {}) =>
    apiFetch<PaginatedResponse<OrderSummary>>('/admin/orders', { query }),
  adminUpdateStatus: (id: string, status: OrderStatus) =>
    apiFetch<Order>(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status } }),
};

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.create,
    // Checkout empties the cart server-side — drop the stale cached cart.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart }),
  });
}

export function useMyOrders(query: Partial<ListOrdersQuery> = {}) {
  return useQuery({ queryKey: queryKeys.myOrders(query), queryFn: () => ordersApi.listMine(query) });
}

export function useOrder(id: string) {
  return useQuery({ queryKey: queryKeys.order(id), queryFn: () => ordersApi.getById(id), enabled: !!id });
}

export function useAdminOrders(query: Partial<ListOrdersQuery> = {}) {
  return useQuery({ queryKey: queryKeys.adminOrders(query), queryFn: () => ordersApi.adminList(query) });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => ordersApi.adminUpdateStatus(id, status),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.order(id) });
    },
  });
}
