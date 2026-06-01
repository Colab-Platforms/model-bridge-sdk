/**
 * Header utilities
 * Helper functions for constructing and managing HTTP headers
 */

/**
 * Build default headers for API requests
 * @param config - SDK configuration
 * @param customHeaders - Custom headers to merge
 * @returns Merged headers object
 */
export function buildHeaders(
  apiKey: string,
  userAgent: string,
  customHeaders?: Record<string, string>,
): Record<string, string> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'User-Agent': userAgent,
    'Accept': 'application/json',
  };

  if (customHeaders) {
    Object.assign(headers, customHeaders);
  }

  return headers;
}

/**
 * Build streaming request headers
 */
export function buildStreamingHeaders(
  apiKey: string,
  userAgent: string,
  customHeaders?: Record<string, string>,
): Record<string, string> {
  const headers = buildHeaders(apiKey, userAgent, customHeaders);
  headers['Accept'] = 'text/event-stream';
  return headers;
}

/**
 * Normalize header names to lowercase
 */
export function normalizeHeaders(headers: Record<string, string>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    normalized[key.toLowerCase()] = value;
  }
  return normalized;
}

/**
 * Extract rate limit info from response headers
 */
export function extractRateLimitInfo(headers: Record<string, string>) {
  const normalized = normalizeHeaders(headers);

  return {
    requestsPerMinute: parseInt(normalized['x-ratelimit-requests-per-minute'] || '0'),
    requestsPerHour: parseInt(normalized['x-ratelimit-requests-per-hour'] || '0'),
    tokensPerMinute: normalized['x-ratelimit-tokens-per-minute']
      ? parseInt(normalized['x-ratelimit-tokens-per-minute'])
      : undefined,
    remaining: {
      requestsPerMinute: parseInt(normalized['x-ratelimit-remaining-requests-per-minute'] || '0'),
      requestsPerHour: parseInt(normalized['x-ratelimit-remaining-requests-per-hour'] || '0'),
      tokensPerMinute: normalized['x-ratelimit-remaining-tokens-per-minute']
        ? parseInt(normalized['x-ratelimit-remaining-tokens-per-minute'])
        : undefined,
    },
    resetAt: normalized['x-ratelimit-reset-at'] || new Date().toISOString(),
  };
}
