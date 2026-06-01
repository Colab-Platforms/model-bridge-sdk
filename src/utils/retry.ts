/**
 * Retry utilities
 * Helper functions for implementing retry logic with exponential backoff
 */

import { RateLimitError } from '../core/errors/RateLimitError';
import { ProviderError } from '../core/errors/ProviderError';

/**
 * Configuration for retry logic
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterFactor: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.1,
};

/**
 * Calculate delay for exponential backoff
 * @param attempt - Attempt number (0-indexed)
 * @param config - Retry configuration
 * @returns Delay in milliseconds
 */
export function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelayMs,
  );

  // Add jitter to prevent thundering herd
  const jitter = exponentialDelay * config.jitterFactor * Math.random();
  return exponentialDelay + jitter;
}

/**
 * Determine if an error is retryable
 * @param error - Error to check
 * @param attempt - Current attempt number
 * @param maxRetries - Maximum number of retries
 * @returns Whether the error should be retried
 */
export function isRetryableError(error: unknown, attempt: number, maxRetries: number): boolean {
  // Don't retry if max retries exceeded
  if (attempt >= maxRetries) {
    return false;
  }

  // Always retry rate limit errors
  if (error instanceof RateLimitError) {
    return true;
  }

  // Retry provider errors that are marked as retryable
  if (error instanceof ProviderError) {
    return error.retryable;
  }

  // Retry network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  return false;
}

/**
 * Execute function with retry logic
 * @param fn - Function to execute
 * @param config - Retry configuration
 * @returns Promise with function result or final error
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (!isRetryableError(error, attempt, finalConfig.maxRetries)) {
        throw error;
      }

      if (attempt < finalConfig.maxRetries) {
        const delay = calculateBackoffDelay(attempt, finalConfig);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Unknown error');
}

/**
 * Sleep for specified duration
 * @param ms - Duration in milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get retry delay from rate limit error
 * @param error - Rate limit error
 * @returns Retry delay in milliseconds
 */
export function getRetryDelayFromError(error: RateLimitError): number {
  if (error.retryAfter) {
    return error.retryAfter * 1000; // Convert seconds to milliseconds
  }
  return DEFAULT_RETRY_CONFIG.initialDelayMs;
}
