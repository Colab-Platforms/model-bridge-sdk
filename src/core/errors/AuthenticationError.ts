/**
 * Authentication Error - 401
 * Thrown when API key is invalid or missing
 */
import { ApiError } from './ApiError';

export class AuthenticationError extends ApiError {
  /**
   * Creates a new AuthenticationError instance
   * @param message - Error message
   * @param options - Additional error options
   */
  constructor(
    message: string = 'Authentication failed',
    options?: {
      requestId?: string;
      details?: Record<string, unknown>;
      headers?: Record<string, string>;
    },
  ) {
    super(message, 401, 'AUTHENTICATION_ERROR', options);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}
