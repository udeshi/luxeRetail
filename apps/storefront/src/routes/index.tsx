import { createFileRoute, Link } from '@tanstack/react-router';
import { useProducts } from '@org/api-client';
import { Button, Spinner } from '@org/ui';
import { ProductCard } from '../components/product-card.js';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const { data, isPending } = useProducts({ page: 1, pageSize: 8 });

  return (
    <div>
      <section className="rounded-3xl bg-brand-800 px-10 py-16 text-white">
        <p className="text-sm font-medium uppercase tracking-widest text-brand-200">New Arrivals</p>
        <h1 className="mt-3 max-w-lg text-4xl font-semibold leading-tight">Elevate Your Everyday</h1>
        <p className="mt-4 max-w-md text-brand-100">
          Curated apparel, accessories, and watches — designed for quiet, considered living.
        </p>
        <Link to="/catalog">
          <Button variant="secondary" size="lg" className="mt-8">
            Shop the Catalog
          </Button>
        </Link>
      </section>

      <section className="mt-16">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-900">New Arrivals</h2>
          <Link to="/catalog" className="text-sm font-medium text-brand-600 hover:text-brand-900">
            View all
          </Link>
        </div>

        {isPending ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {data?.items.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>
    </div>
  );
}
