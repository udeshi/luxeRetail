import { describe, expect, it } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Tailored Emerald Blazer')).toBe('tailored-emerald-blazer');
  });

  it('strips non-alphanumeric characters', () => {
    expect(slugify("Men's Wide-Leg Trouser!")).toBe('men-s-wide-leg-trouser');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  --Sale Item--  ')).toBe('sale-item');
  });
});
