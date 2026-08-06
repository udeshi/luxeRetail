import { describe, expect, it } from 'vitest';
import { LoginRequestSchema, RegisterRequestSchema } from './auth.schema';

describe('RegisterRequestSchema', () => {
  it('accepts a valid registration payload', () => {
    const result = RegisterRequestSchema.safeParse({
      email: 'customer@luxeretail.dev',
      password: 'Password123!',
      firstName: 'Sam',
      lastName: 'Customer',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = RegisterRequestSchema.safeParse({
      email: 'customer@luxeretail.dev',
      password: 'short',
      firstName: 'Sam',
      lastName: 'Customer',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed email', () => {
    const result = RegisterRequestSchema.safeParse({
      email: 'not-an-email',
      password: 'Password123!',
      firstName: 'Sam',
      lastName: 'Customer',
    });
    expect(result.success).toBe(false);
  });
});

describe('LoginRequestSchema', () => {
  it('rejects an empty password', () => {
    const result = LoginRequestSchema.safeParse({ email: 'customer@luxeretail.dev', password: '' });
    expect(result.success).toBe(false);
  });
});
