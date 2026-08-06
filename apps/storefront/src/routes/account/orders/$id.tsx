import { createFileRoute } from '@tanstack/react-router';
import { useOrder } from '@org/api-client';
import { Badge, Spinner } from '@org/ui';
import { formatPrice } from '@org/utils';
import { requireAuth } from '../../../lib/auth-guard.js';

export const Route = createFileRoute('/account/orders/$id')({
  beforeLoad: requireAuth,
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { id } = Route.useParams();
  const { data: order, isPending } = useOrder(id);

  if (isPending) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (!order) return <p className="py-20 text-center text-brand-500">Order not found.</p>;

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-900">Order #{order.id.slice(0, 8)}</h1>
        <Badge variant="status">{order.status}</Badge>
      </div>
      <p className="mt-1 text-sm text-brand-500">{new Date(order.createdAt).toLocaleString()}</p>

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
        <div className="mt-4 space-y-1 border-t border-brand-100 pt-4 text-sm text-brand-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotalCents, order.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{order.shippingCents === 0 ? 'Free' : formatPrice(order.shippingCents, order.currency)}</span>
          </div>
          <div className="flex justify-between font-medium text-brand-900">
            <span>Total</span>
            <span>{formatPrice(order.totalCents, order.currency)}</span>
          </div>
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
