import { Link } from '@tanstack/react-router';
import { formatPrice } from '@org/utils';
import type { ProductSummary } from '@org/contracts';
import { Badge } from '@org/ui';

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link to="/products/$slug" params={{ slug: product.slug }} className="group block">
      <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-brand-50">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-300">No image</div>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium text-brand-900">{product.name}</h3>
          <p className="mt-1 text-sm text-brand-600">{formatPrice(product.basePriceCents, product.currency)}</p>
        </div>
        {product.status === 'DRAFT' && <Badge variant="status">Draft</Badge>}
      </div>
    </Link>
  );
}
