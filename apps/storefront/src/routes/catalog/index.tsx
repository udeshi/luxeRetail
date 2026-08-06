import type { ReactNode } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { useCategories, useProducts } from '@org/api-client';
import { cn, Input, Spinner } from '@org/ui';
import { ProductCard } from '../../components/product-card.js';

const catalogSearchSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
});

export const Route = createFileRoute('/catalog/')({
  component: CatalogPage,
  validateSearch: catalogSearchSchema,
});

function CatalogPage() {
  const { category, search } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: categories } = useCategories();
  const { data, isPending } = useProducts({ categorySlug: category, search, page: 1, pageSize: 24 });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-brand-900">Catalog</h1>
        <Input
          placeholder="Search products..."
          defaultValue={search}
          className="sm:w-72"
          onChange={(e) => navigate({ search: (prev) => ({ ...prev, search: e.target.value || undefined }) })}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterPill
          active={!category}
          onClick={() => navigate({ search: (prev) => ({ ...prev, category: undefined }) })}
        >
          All Items
        </FilterPill>
        {categories?.map((c) => (
          <FilterPill
            key={c.id}
            active={category === c.slug}
            onClick={() => navigate({ search: (prev) => ({ ...prev, category: c.slug }) })}
          >
            {c.name}
          </FilterPill>
        ))}
      </div>

      {isPending ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {data.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-center text-brand-500">No products match your filters.</p>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-brand-800 text-white' : 'bg-brand-50 text-brand-700 hover:bg-brand-100',
      )}
    >
      {children}
    </button>
  );
}
