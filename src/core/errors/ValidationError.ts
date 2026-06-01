/**
 * Validation Error - 400
 * Thrown when input validation fails
 */
import { ApiError } from './ApiError';

export class ValidationError extends ApiError {
  /**
   * List of validation errors
   */
  public validationErrors: Array<{
    field: string;
    message: string;
  }>;

  /**
   * Creates a new ValidationError instance
   * @param message - Error message
   * @param validationErrors - Array of validation errors
   * @param options - Additional error options
   */
  constructor(
    message: string = 'Validation failed',
    validationErrors: Array<{ field: string; message: string }> = [],
    options?: {
      requestId?: string;
      details?: Record<string, unknown>;
      headers?: Record<string, string>;
    },
  ) {
    super(message, 400, 'VALIDATION_ERROR', options);
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
