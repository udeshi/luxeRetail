import { createFileRoute, Link } from '@tanstack/react-router';
import { useAdminOrders } from '@org/api-client';
import { Badge, Spinner } from '@org/ui';
import { formatPrice } from '@org/utils';
import { requireAdmin } from '../../lib/auth-guard.js';

export const Route = createFileRoute('/orders/')({
  beforeLoad: requireAdmin,
  component: OrdersPage,
});

function OrdersPage() {
  const { data, isPending } = useAdminOrders({ page: 1, pageSize: 50 });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-900">Orders</h1>

      {isPending ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-brand-100">
          <table className="w-full text-sm">
            <thead className="bg-brand-50 text-left text-xs font-medium uppercase tracking-wide text-brand-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {data?.items.map((order) => (
                <tr key={order.id} className="cursor-pointer hover:bg-brand-50">
                  <td className="px-4 py-3">
                    <Link to="/orders/$id" params={{ id: order.id }} className="font-medium text-brand-800 hover:underline">
                      #{order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant="status">{order.status}</Badge>
                  </td>
                  <td className="px-4 py-3">{formatPrice(order.totalCents, order.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
