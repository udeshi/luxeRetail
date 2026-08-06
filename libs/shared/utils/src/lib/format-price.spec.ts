import { describe, expect, it } from 'vitest';
import { formatPrice } from './format-price';

describe('formatPrice', () => {
  it('renders integer cents as a localized currency string', () => {
    expect(formatPrice(45000, 'usd')).toBe('$450.00');
  });

  it('defaults to usd when no currency is given', () => {
    expect(formatPrice(1999)).toBe('$19.99');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });
});
