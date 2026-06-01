/**
 * Provider Error - 502/503
 * Thrown when underlying AI provider returns an error
 */
import { ApiError } from './ApiError';

export class ProviderError extends ApiError {
  /**
   * Name of the underlying provider
   */
  public provider?: string;

  /**
   * Original provider error code
   */
  public providerCode?: string;

  /**
   * Whether the request is retryable
   */
  public retryable: boolean;

  /**
   * Creates a new ProviderError instance
   * @param message - Error message
   * @param provider - Provider name
   * @param retryable - Whether error is retryable
   * @param options - Additional error options
   */
  constructor(
    message: string = 'Provider error',
    provider?: string,
    retryable: boolean = false,
    options?: {
      requestId?: string;
      details?: Record<string, unknown>;
      headers?: Record<string, string>;
    },
  ) {
    const status = retryable ? 503 : 502;
    super(message, status, 'PROVIDER_ERROR', options);
    this.name = 'ProviderError';
    this.provider = provider;
    this.retryable = retryable;
    Object.setPrototypeOf(this, ProviderError.prototype);
  }
}
