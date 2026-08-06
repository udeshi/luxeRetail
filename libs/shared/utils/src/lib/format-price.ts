/** Renders integer cents + a currency code as a localized display string, e.g. formatPrice(45000, 'usd') -> "$450.00". */
export function formatPrice(amountCents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}
