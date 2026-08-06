import { createFileRoute, Link } from '@tanstack/react-router';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { useOrder } from '@org/api-client';
import { Button, Spinner } from '@org/ui';
import { formatPrice } from '@org/utils';
import { requireAuth } from '../../lib/auth-guard.js';

export const Route = createFileRoute('/checkout/success')({
  beforeLoad: requireAuth,
  validateSearch: z.object({ orderId: z.string() }),
  component: CheckoutSuccessPage,
});

function CheckoutSuccessPage() {
  const { orderId } = Route.useSearch();
  const { data: order, isPending } = useOrder(orderId);

  if (isPending) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }
  if (!order) return <p className="py-24 text-center text-brand-500">Order not found.</p>;

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-brand-600" />
      <h1 className="mt-4 text-2xl font-semibold text-brand-900">Thank you for your order</h1>
      <p className="mt-2 text-brand-500">
        Order #{order.id.slice(0, 8)} — a confirmation email is on its way.
      </p>

      <div className="mt-8 rounded-2xl border border-brand-100 p-6 text-left">
        <ul className="space-y-2 text-sm text-brand-700">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.productName} × {item.quantity}
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

      <Link to="/catalog">
        <Button className="mt-8">Continue shopping</Button>
      </Link>
    </div>
  );
}
