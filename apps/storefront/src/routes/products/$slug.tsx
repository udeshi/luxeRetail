import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAddCartItem, useProduct } from '@org/api-client';
import { Button, Spinner } from '@org/ui';
import { formatPrice } from '@org/utils';
import { useSessionStore } from '../../lib/session-store.js';

export const Route = createFileRoute('/products/$slug')({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const { data: product, isPending } = useProduct(slug);
  const isAuthenticated = useSessionStore((s) => s.status === 'authenticated');
  const navigate = useNavigate();
  const addItem = useAddCartItem();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  if (isPending) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }
  if (!product) return <p className="py-24 text-center text-brand-500">Product not found.</p>;

  const variant = product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-2xl bg-brand-50">
        {product.images[0] ? (
          <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-brand-900">{product.name}</h1>
        <p className="mt-2 text-lg text-brand-700">{formatPrice(variant?.priceCents ?? product.basePriceCents, product.currency)}</p>
        <p className="mt-6 text-sm leading-relaxed text-brand-600">{product.description}</p>

        {product.variants.length > 1 && (
          <div className="mt-8">
            <p className="mb-2 text-sm font-medium text-brand-800">Options</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const label = Object.values(v.attributes).join(' / ');
                const isSelected = (selectedVariantId ?? product.variants[0].id) === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    disabled={v.inventoryQty === 0}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${
                      isSelected ? 'border-brand-800 bg-brand-800 text-white' : 'border-brand-200 text-brand-700 hover:bg-brand-50'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Button
          size="lg"
          className="mt-8 w-full sm:w-auto"
          loading={addItem.isPending}
          disabled={!variant || variant.inventoryQty === 0}
          onClick={() => {
            if (!isAuthenticated) {
              navigate({ to: '/login' });
              return;
            }
            if (variant) addItem.mutate({ productVariantId: variant.id, quantity: 1 });
          }}
        >
          {variant && variant.inventoryQty === 0 ? 'Out of stock' : 'Add to Cart'}
        </Button>
        {addItem.isSuccess && <p className="mt-3 text-sm text-brand-600">Added to your cart.</p>}
      </div>
    </div>
  );
}
