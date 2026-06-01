/**
 * Rate Limit Error - 429
 * Thrown when rate limit is exceeded
 */
import { ApiError } from './ApiError';

export class RateLimitError extends ApiError {
  /**
   * Seconds until rate limit resets
   */
  public retryAfter?: number;

  /**
   * Creates a new RateLimitError instance
   * @param message - Error message
   * @param retryAfter - Seconds until retry
   * @param options - Additional error options
   */
  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    options?: {
      requestId?: string;
      details?: Record<string, unknown>;
      headers?: Record<string, string>;
    },
  ) {
    super(message, 429, 'RATE_LIMIT_ERROR', options);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}
