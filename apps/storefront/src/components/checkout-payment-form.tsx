import { useState, type FormEvent } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button } from '@org/ui';

export function CheckoutPaymentForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success?orderId=${orderId}` },
    });

    // confirmPayment only returns if it failed synchronously (e.g. a
    // declined test card) — success navigates via return_url instead.
    if (confirmError) {
      setError(confirmError.message ?? 'Payment failed — please try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="w-full" loading={isSubmitting} disabled={!stripe}>
        Pay now
      </Button>
      <p className="text-center text-xs text-brand-400">
        Test mode — use card 4242 4242 4242 4242, any future date, any CVC.
      </p>
    </form>
  );
}
