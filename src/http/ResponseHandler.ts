/**
 * HTTP Response Handler
 * Handles parsing and error mapping for HTTP responses
 */

import { ApiError } from '../core/errors/ApiError';
import { AuthenticationError } from '../core/errors/AuthenticationError';
import { InsufficientCreditsError } from '../core/errors/InsufficientCreditsError';
import { ProviderError } from '../core/errors/ProviderError';
import { RateLimitError } from '../core/errors/RateLimitError';
import { ValidationError } from '../core/errors/ValidationError';
import { ApiErrorResponse, HttpResponse } from '../core/types/responses';

/**
 * Response handler for processing HTTP responses
 */
export class ResponseHandler {
  /**
   * Parse and validate HTTP response
   * @param response - Fetch Response object
   * @returns Parsed response data
   * @throws Appropriate error based on status code
   */
  static async handle<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type') || '';
    const isJSON = contentType.includes('application/json'); 

    let data: unknown = null;

    // Parse response body based on content type
    if (isJSON) {
      data = await this.parseJSON(response);
    } else if (contentType.includes('text/plain')) {
      data = await response.text();
    } else {
      data = await response.text();
    }

    // Handle error status codes
    if (!response.ok) {
      throw this.mapErrorResponse(response, data as ApiErrorResponse);
    }

    return data as T;
  }

  /**
   * Parse JSON response with error handling
   */
  private static async parseJSON(response: Response): Promise<unknown> {
    try {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch {
      throw new ApiError('Failed to parse JSON response', response.status, 'JSON_PARSE_ERROR', {
        headers: this.headersToRecord(response.headers),
      });
    }
  }

  /**
   * Map HTTP status codes to appropriate error classes
   */
  private static mapErrorResponse(response: Response, data: unknown): ApiError {
    const headers = this.headersToRecord(response.headers);
    const requestId = response.headers.get('x-request-id') || undefined;

    const errorData =
      typeof data === 'object' && data !== null
        ? (data as Record<string, unknown>)
        : { message: response.statusText };

    const errorMessage = (errorData.message as string) || response.statusText;
    const errorCode = (errorData.code as string) || `HTTP_${response.status}`;
    const details = this.extractErrorDetails(errorData);

    switch (response.status) {
      case 400:
        // Validation error
        const validationErrors =
          (errorData.errors as Array<{ field: string; message: string }>) || [];
        return new ValidationError(errorMessage, validationErrors, {
          requestId,
          details,
          headers,
        });

      case 401:
        // Authentication error
        return new AuthenticationError(errorMessage, {
          requestId,
          details,
          headers,
        });

      case 402:
        // Insufficient credits error
        const required = errorData.required as number | undefined;
        const available = errorData.available as number | undefined;
        return new InsufficientCreditsError(errorMessage, required, available, {
          requestId,
          details,
          headers,
        });

      case 429:
        // Rate limit error
        const retryAfter = this.parseRetryAfter(response.headers);
        return new RateLimitError(errorMessage, retryAfter, {
          requestId,
          details,
          headers,
        });

      case 502:
      case 503:
        // Provider errors
        const provider = (errorData.provider as string | undefined);
        const retryable = response.status === 503;
        return new ProviderError(errorMessage, provider, retryable, {
          requestId,
          details,
          headers,
        });

      default:
        // Generic API error
        return new ApiError(errorMessage, response.status, errorCode, {
          requestId,
          details,
          headers,
        });
    }
  }

  /**
   * Parse Retry-After header
   */
  private static parseRetryAfter(headers: Headers): number | undefined {
    const retryAfter = headers.get('retry-after');
    if (!retryAfter) return undefined;

    // Retry-After can be seconds (number) or HTTP date
    const seconds = parseInt(retryAfter, 10);
    if (!Number.isNaN(seconds)) {
      return seconds;
    }

    // Try parsing as date
    const retryDate = new Date(retryAfter);
    if (!Number.isNaN(retryDate.getTime())) {
      const now = new Date();
      return Math.ceil((retryDate.getTime() - now.getTime()) / 1000);
    }

    return undefined;
  }

  /**
   * Convert Headers object to record
   */
  private static headersToRecord(headers: Headers): Record<string, string> {
    const record: Record<string, string> = {};
    headers.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }

  /**
   * Preserve server error fields even when the backend does not normalize them
   */
  private static extractErrorDetails(errorData: Record<string, unknown>): Record<string, unknown> | undefined {
    const explicitDetails = errorData.details;
    if (explicitDetails && typeof explicitDetails === 'object' && explicitDetails !== null) {
      return explicitDetails as Record<string, unknown>;
    }

    const passthroughEntries = Object.entries(errorData).filter(([key]) => {
      return !['message', 'code', 'details'].includes(key);
    });

    if (passthroughEntries.length === 0) {
      return undefined;
    }

    return Object.fromEntries(passthroughEntries);
  }

  /**
   * Create HTTP response wrapper
   */
  static createHttpResponse<T>(
    status: number,
    statusText: string,
    headers: Record<string, string>,
    data: T,
  ): HttpResponse<T> {
    return {
      status,
      statusText,
      headers,
      data,
    };
  }
}
