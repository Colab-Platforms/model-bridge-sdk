/**
 * HTTP Request Builder
 * Constructs fetch request objects with proper configuration
 */

import { ContentType, HttpMethod } from '../core/types/common';

/**
 * Request builder for constructing fetch requests
 */
export class RequestBuilder {
  /**
   * Build a fetch request
   * @param method - HTTP method
   * @param _url - Full request URL
   * @param options - Request options
   * @returns RequestInit object for fetch
   */
  static build(
    method: HttpMethod,
    _url: string,
    options?: {
      headers?: Record<string, string>;
      body?: unknown;
      timeout?: number;
      signal?: AbortSignal;
      contentType?: ContentType;
    },
  ): RequestInit {
    const requestInit: RequestInit & { __cleanupTimeout?: () => void } = {
      method,
      headers: options?.headers || {},
    };

    // Set body for methods that support it
    if (options?.body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      if (typeof options.body === 'string') {
        requestInit.body = options.body;
      } else {
        requestInit.body = JSON.stringify(options.body);
      }
    }

    // Handle signal
    if (options?.signal) {
      requestInit.signal = options.signal;
    } else if (options?.timeout) {
      // Create abort controller with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout);
      const cleanup = () => clearTimeout(timeoutId);
      requestInit.signal = controller.signal;
      requestInit.__cleanupTimeout = cleanup;

      // Clean up timeout on completion
      (requestInit.signal as AbortSignal).addEventListener('abort', cleanup, { once: true });
    }

    return requestInit;
  }

  /**
   * Build URL with query parameters
   * @param baseUrl - Base URL
   * @param params - Query parameters
   * @returns Full URL with query string
   */
  static buildUrl(baseUrl: string, params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return baseUrl;
    }

    const url = new URL(baseUrl);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    }

    return url.toString();
  }

  /**
   * Build full endpoint URL
   * @param baseURL - API base URL
   * @param endpoint - Endpoint path (should start with /)
   * @returns Full URL
   */
  static buildEndpointUrl(baseURL: string, endpoint: string): string {
    const base = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }

  /**
   * Merge request headers
   * @param defaults - Default headers
   * @param custom - Custom headers to merge
   * @returns Merged headers
   */
  static mergeHeaders(
    defaults: Record<string, string>,
    custom?: Record<string, string>,
  ): Record<string, string> {
    return {
      ...defaults,
      ...custom,
    };
  }

  /**
   * Validate request method
   */
  static validateMethod(method: string): method is HttpMethod {
    const validMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'];
    return validMethods.includes(method as HttpMethod);
  }
}
