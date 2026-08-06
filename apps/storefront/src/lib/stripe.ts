import { loadStripe } from '@stripe/stripe-js';

/** Loaded once and reused — Stripe.js discourages calling loadStripe() more
 *  than once per page. Publishable key only, safe to expose client-side. */
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '');
