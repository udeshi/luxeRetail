import { describe, expect, it } from 'vitest';
import { ApiError } from './api-error';

describe('ApiError', () => {
  it('exposes the HTTP status and message', () => {
    const error = new ApiError(404, 'Product not found');
    expect(error.status).toBe(404);
    expect(error.message).toBe('Product not found');
    expect(error.name).toBe('ApiError');
  });

  it('is a validation error only when field errors are present', () => {
    expect(new ApiError(422, 'Validation failed', [{ path: 'email', message: 'Invalid email' }]).isValidationError).toBe(
      true,
    );
    expect(new ApiError(500, 'Internal server error').isValidationError).toBe(false);
  });
});
