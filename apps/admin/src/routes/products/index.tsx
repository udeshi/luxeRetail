import { createFileRoute, Link } from '@tanstack/react-router';
import { useAdminProducts, useDeleteProduct } from '@org/api-client';
import { Badge, Button, Spinner } from '@org/ui';
import { formatPrice } from '@org/utils';
import { requireAdmin } from '../../lib/auth-guard.js';

export const Route = createFileRoute('/products/')({
  beforeLoad: requireAdmin,
  component: ProductsPage,
});

function ProductsPage() {
  const { data, isPending } = useAdminProducts({ page: 1, pageSize: 50 });
  const deleteProduct = useDeleteProduct();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-900">Products</h1>
        <Link to="/products/new">
          <Button>New Product</Button>
        </Link>
      </div>

      {isPending ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-brand-100">
          <table className="w-full text-sm">
            <thead className="bg-brand-50 text-left text-xs font-medium uppercase tracking-wide text-brand-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {data?.items.map((product) => (
                <tr key={product.id}>
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-brand-50">
                      {product.thumbnailUrl && <img src={product.thumbnailUrl} className="h-full w-full object-cover" alt="" />}
                    </div>
                    {product.name}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={product.status === 'ACTIVE' ? 'brand' : 'subtle'}>{product.status}</Badge>
                  </td>
                  <td className="px-4 py-3">{formatPrice(product.basePriceCents, product.currency)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to="/products/$id/edit" params={{ id: product.id }}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Delete "${product.name}"?`)) deleteProduct.mutate(product.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
