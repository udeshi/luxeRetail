/** Mirrors the problem-detail body shape from the API's global exception
 *  filter (apps/api/src/common/filters/http-exception.filter.ts). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors?: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** True for a 422/400-style validation failure with per-field messages. */
  get isValidationError(): boolean {
    return Boolean(this.fieldErrors?.length);
  }
}
