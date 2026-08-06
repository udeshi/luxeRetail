import { createFileRoute } from '@tanstack/react-router';
import { useOrder, useUpdateOrderStatus } from '@org/api-client';
import type { OrderStatus } from '@org/contracts';
import { Badge, Select, Spinner } from '@org/ui';
import { formatPrice } from '@org/utils';
import { requireAdmin } from '../../lib/auth-guard.js';

export const Route = createFileRoute('/orders/$id')({
  beforeLoad: requireAdmin,
  component: OrderDetailPage,
});

const STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'FULFILLED', 'CANCELLED'];

function OrderDetailPage() {
  const { id } = Route.useParams();
  const { data: order, isPending } = useOrder(id);
  const updateStatus = useUpdateOrderStatus();

  if (isPending) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (!order) return <p className="text-brand-500">Order not found.</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-900">Order #{order.id.slice(0, 8)}</h1>
        <Badge variant="status">{order.status}</Badge>
      </div>
      <p className="mt-1 text-sm text-brand-500">{new Date(order.createdAt).toLocaleString()}</p>

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-brand-100 p-4">
        <span className="text-sm font-medium text-brand-800">Update status</span>
        <Select
          value={order.status}
          disabled={updateStatus.isPending}
          onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value as OrderStatus })}
          className="w-48"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-6 rounded-2xl border border-brand-100 p-6">
        <ul className="space-y-2 text-sm text-brand-700">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.productName} ({Object.values(item.variantAttributes).join(' / ')}) × {item.quantity}
              </span>
              <span>{formatPrice(item.unitPriceCents * item.quantity, order.currency)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-brand-100 pt-4 font-medium text-brand-900">
          <span>Total</span>
          <span>{formatPrice(order.totalCents, order.currency)}</span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-brand-100 p-6 text-sm text-brand-700">
        <h2 className="mb-2 font-semibold text-brand-900">Shipping address</h2>
        <p>{order.shippingAddress.line1}</p>
        {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
        <p>
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
        </p>
        <p>{order.shippingAddress.country}</p>
      </div>
    </div>
  );
}
