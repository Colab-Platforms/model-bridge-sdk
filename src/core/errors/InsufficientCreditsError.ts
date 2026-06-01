/**
 * Insufficient Credits Error - 402
 * Thrown when account does not have enough credits
 */
import { ApiError } from './ApiError';

export class InsufficientCreditsError extends ApiError {
  /**
   * Required credits for operation
   */
  public required?: number;

  /**
   * Available credits
   */
  public available?: number;

  /**
   * Creates a new InsufficientCreditsError instance
   * @param message - Error message
   * @param required - Required credits
   * @param available - Available credits
   * @param options - Additional error options
   */
  constructor(
    message: string = 'Insufficient credits',
    required?: number,
    available?: number,
    options?: {
      requestId?: string;
      details?: Record<string, unknown>;
      headers?: Record<string, string>;
    },
  ) {
    super(message, 402, 'INSUFFICIENT_CREDITS', options);
    this.name = 'InsufficientCreditsError';
    this.required = required;
    this.available = available;
    Object.setPrototypeOf(this, InsufficientCreditsError.prototype);
  }
}
