/**
 * Common types and interfaces used across the ModelBridge SDK
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: GatewayMetadata;
}

/**
 * Gateway metadata returned with responses
 */
export interface GatewayMetadata {
  requestId: string;
  timestamp: string;
  processedBy: string;
  region?: string;
}

/**
 * Pagination options for list endpoints
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
}

/**
 * Generic paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Standard API request options
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';

/**
 * Content type options
 */
export type ContentType = 'application/json' | 'text/plain' | 'application/x-www-form-urlencoded';
