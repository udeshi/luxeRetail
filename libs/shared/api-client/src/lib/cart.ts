import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Cart } from '@org/contracts';
import { apiFetch } from './http-client';
import { queryKeys } from './query-keys';

export const cartApi = {
  get: () => apiFetch<Cart>('/cart'),
  addItem: (productVariantId: string, quantity = 1) =>
    apiFetch<Cart>('/cart/items', { method: 'POST', body: { productVariantId, quantity } }),
  setItemQuantity: (itemId: string, quantity: number) =>
    apiFetch<Cart>(`/cart/items/${itemId}`, { method: 'PATCH', body: { quantity } }),
  clear: () => apiFetch<Cart>('/cart', { method: 'DELETE' }),
};

/** `enabled` should come from the caller's session store — there's nothing
 *  to fetch before the user is signed in. */
export function useCart(enabled: boolean) {
  return useQuery({ queryKey: queryKeys.cart, queryFn: cartApi.get, enabled });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productVariantId, quantity }: { productVariantId: string; quantity?: number }) =>
      cartApi.addItem(productVariantId, quantity),
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart, cart),
  });
}

export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.setItemQuantity(itemId, quantity),
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart, cart),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartApi.clear,
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart, cart),
  });
}
