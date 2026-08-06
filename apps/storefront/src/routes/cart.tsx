import { createFileRoute, Link } from '@tanstack/react-router';
import { useCart, useUpdateCartItemQuantity } from '@org/api-client';
import { Button, Spinner } from '@org/ui';
import { formatPrice } from '@org/utils';
import { requireAuth } from '../lib/auth-guard.js';

export const Route = createFileRoute('/cart')({
  beforeLoad: requireAuth,
  component: CartPage,
});

function CartPage() {
  const { data: cart, isPending } = useCart(true);
  const updateQuantity = useUpdateCartItemQuantity();

  if (isPending) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-brand-500">Your cart is empty.</p>
        <Link to="/catalog">
          <Button className="mt-6">Browse the catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="text-2xl font-semibold text-brand-900">Your Cart</h1>
        <ul className="mt-6 divide-y divide-brand-100">
          {cart.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-5">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                {item.thumbnailUrl && <img src={item.thumbnailUrl} alt={item.productName} className="h-full w-full object-cover" />}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link to="/products/$slug" params={{ slug: item.productSlug }} className="font-medium text-brand-900 hover:underline">
                      {item.productName}
                    </Link>
                    <p className="text-xs text-brand-500">{Object.values(item.variantAttributes).join(' / ')}</p>
                  </div>
                  <p className="font-medium text-brand-900">{formatPrice(item.unitPriceCents * item.quantity, cart.currency)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <QuantityStepper
                    quantity={item.quantity}
                    onChange={(quantity) => updateQuantity.mutate({ itemId: item.id, quantity })}
                  />
                  <button
                    className="text-xs font-medium text-brand-400 hover:text-red-600"
                    onClick={() => updateQuantity.mutate({ itemId: item.id, quantity: 0 })}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded-2xl border border-brand-100 p-6">
        <h2 className="font-semibold text-brand-900">Order Summary</h2>
        <div className="mt-4 flex justify-between text-sm text-brand-700">
          <span>Subtotal</span>
          <span>{formatPrice(cart.subtotalCents, cart.currency)}</span>
        </div>
        <p className="mt-1 text-xs text-brand-400">Shipping and taxes calculated at checkout.</p>
        <Link to="/checkout">
          <Button className="mt-6 w-full" size="lg">
            Checkout
          </Button>
        </Link>
      </aside>
    </div>
  );
}

function QuantityStepper({ quantity, onChange }: { quantity: number; onChange: (quantity: number) => void }) {
  return (
    <div className="flex items-center rounded-full border border-brand-200">
      <button className="px-3 py-1 text-brand-700" onClick={() => onChange(Math.max(0, quantity - 1))}>
        −
      </button>
      <span className="w-6 text-center text-sm">{quantity}</span>
      <button className="px-3 py-1 text-brand-700" onClick={() => onChange(quantity + 1)}>
        +
      </button>
    </div>
  );
}
