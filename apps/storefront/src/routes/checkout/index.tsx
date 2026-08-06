import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Elements } from '@stripe/react-stripe-js';
import { AddressInputSchema, type AddressInput } from '@org/contracts';
import { useCart, useCreateOrder } from '@org/api-client';
import { Button, Input, Spinner } from '@org/ui';
import { formatPrice } from '@org/utils';
import { requireAuth } from '../../lib/auth-guard.js';
import { stripePromise } from '../../lib/stripe.js';
import { CheckoutPaymentForm } from '../../components/checkout-payment-form.js';

export const Route = createFileRoute('/checkout/')({
  beforeLoad: requireAuth,
  component: CheckoutPage,
});

function CheckoutPage() {
  const { data: cart, isPending: isCartPending } = useCart(true);
  const createOrder = useCreateOrder();
  const [orderResult, setOrderResult] = useState<{ orderId: string; clientSecret: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressInput>({ resolver: zodResolver(AddressInputSchema) });

  if (isCartPending) {
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
    <div className="mx-auto grid max-w-3xl gap-10 md:grid-cols-[1fr_260px]">
      <div>
        <h1 className="text-2xl font-semibold text-brand-900">Checkout</h1>

        {!orderResult ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit((address) =>
              createOrder.mutate(
                { shippingAddress: address },
                { onSuccess: (result) => setOrderResult({ orderId: result.order.id, clientSecret: result.clientSecret }) },
              ),
            )}
          >
            <h2 className="text-sm font-semibold text-brand-800">Shipping address</h2>
            <Input placeholder="Address line 1" error={errors.line1?.message} {...register('line1')} />
            <Input placeholder="Address line 2 (optional)" {...register('line2')} />
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="City" error={errors.city?.message} {...register('city')} />
              <Input placeholder="State" error={errors.state?.message} {...register('state')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Postal code" error={errors.postalCode?.message} {...register('postalCode')} />
              <Input placeholder="Country (2-letter code)" error={errors.country?.message} {...register('country')} />
            </div>
            <Input placeholder="Phone (optional)" {...register('phone')} />
            {createOrder.isError && <p className="text-sm text-red-600">{createOrder.error.message}</p>}
            <Button type="submit" size="lg" className="w-full" loading={createOrder.isPending}>
              Continue to payment
            </Button>
          </form>
        ) : (
          <div className="mt-6">
            <h2 className="mb-4 text-sm font-semibold text-brand-800">Payment</h2>
            <Elements stripe={stripePromise} options={{ clientSecret: orderResult.clientSecret }}>
              <CheckoutPaymentForm orderId={orderResult.orderId} />
            </Elements>
          </div>
        )}
      </div>

      <aside className="h-fit rounded-2xl border border-brand-100 p-6">
        <h2 className="font-semibold text-brand-900">Order Summary</h2>
        <ul className="mt-4 space-y-2 text-sm text-brand-700">
          {cart.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.productName} × {item.quantity}
              </span>
              <span>{formatPrice(item.unitPriceCents * item.quantity, cart.currency)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-brand-100 pt-4 text-sm font-medium text-brand-900">
          <span>Subtotal</span>
          <span>{formatPrice(cart.subtotalCents, cart.currency)}</span>
        </div>
      </aside>
    </div>
  );
}
