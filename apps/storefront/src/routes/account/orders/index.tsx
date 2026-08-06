import { createFileRoute, Link } from '@tanstack/react-router';
import { useMyOrders } from '@org/api-client';
import { Badge, Button, Spinner } from '@org/ui';
import { formatPrice } from '@org/utils';
import { requireAuth } from '../../../lib/auth-guard.js';

export const Route = createFileRoute('/account/orders/')({
  beforeLoad: requireAuth,
  component: OrderHistoryPage,
});

function OrderHistoryPage() {
  const { data, isPending } = useMyOrders({ page: 1, pageSize: 20 });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-900">Order History</h1>

      {isPending ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : data && data.items.length > 0 ? (
        <ul className="mt-6 divide-y divide-brand-100 rounded-2xl border border-brand-100">
          {data.items.map((order) => (
            <li key={order.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-brand-900">Order #{order.id.slice(0, 8)}</p>
                <p className="text-xs text-brand-500">{new Date(order.createdAt).toLocaleDateString()} · {order.itemCount} items</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="status">{order.status}</Badge>
                <span className="font-medium text-brand-900">{formatPrice(order.totalCents, order.currency)}</span>
                <Link to="/account/orders/$id" params={{ id: order.id }}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-16 text-center text-brand-500">You haven&rsquo;t placed any orders yet.</p>
      )}
    </div>
  );
}
