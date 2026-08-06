import { useQuery } from '@tanstack/react-query';
import type { Category } from '@org/contracts';
import { apiFetch } from './http-client';
import { queryKeys } from './query-keys';

export const categoriesApi = {
  list: () => apiFetch<Category[]>('/categories'),
};

export function useCategories() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: categoriesApi.list });
}
