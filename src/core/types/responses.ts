/**
 * API response types for structured responses
 */

import { GatewayMetadata } from './common';

/**
 * Generic API error response structure
 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  status: number;
  requestId?: string;
  timestamp?: string;
  details?: Record<string, unknown>;
}

/**
 * HTTP response wrapper with metadata
 */
export interface HttpResponse<T> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  metadata?: GatewayMetadata;
}

/**
 * Successful response wrapper
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  metadata?: GatewayMetadata;
}

/**
 * Error response wrapper
 */
export interface ErrorResponse {
  success: false;
  error: ApiErrorResponse;
  metadata?: GatewayMetadata;
}

/**
 * Union type for API responses
 */
export type ApiResponseResult<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Rate limit headers extracted from response
 */
export interface RateLimitHeaders {
  limitRequests?: number;
  limitTokens?: number;
  remainingRequests?: number;
  remainingTokens?: number;
  resetAt?: string;
}
