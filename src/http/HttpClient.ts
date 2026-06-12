/**
 * HTTP Client
 * Centralized HTTP client for all API requests
 */

import { RequestOptions, HttpMethod } from '../core/types/common';
import { ResponseHandler } from './ResponseHandler';
import { RequestBuilder } from './RequestBuilder';
import { buildHeaders, buildStreamingHeaders } from '../utils/headers';
import { withRetry, RetryConfig } from '../utils/retry';
import { createStream, Stream } from '../core/stream/Stream';
import { SDKConfig } from '../core/config/SDKConfig';

/**
 * HTTP client for making API requests
 * Handles all fetch operations, retries, and error mapping
 */
export class HttpClient {
  /**
   * SDK configuration
   */
  private config: SDKConfig;

  /**
   * Internal request init shape that carries timeout cleanup for fetch calls.
   */
  private typeSafeCleanup(requestInit: RequestInit): void {
    (requestInit as RequestInit & { __cleanupTimeout?: () => void }).__cleanupTimeout?.();
  }

  /**
   * Creates a new HttpClient instance
   * @param config - SDK configuration
   */
  constructor(config: SDKConfig) {
    this.config = config;
  }

  /**
   * Make a GET request
   * @param endpoint - API endpoint
   * @param query - Query parameters
   * @param options - Request options
   * @returns Promise resolving to response data
   */
  async get<T>(
    endpoint: string,
    query?: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<T> {
    const url = RequestBuilder.buildEndpointUrl(this.config.baseURL, endpoint);
    const fullUrl = RequestBuilder.buildUrl(url, query);

    return this.request<T>('GET', fullUrl, undefined, options);
  }

  /**
   * Make a POST request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param options - Request options
   * @returns Promise resolving to response data
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const url = RequestBuilder.buildEndpointUrl(this.config.baseURL, endpoint);
    return this.request<T>('POST', url, body, options);
  }

  /**
   * Make a PUT request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param options - Request options
   * @returns Promise resolving to response data
   */
  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const url = RequestBuilder.buildEndpointUrl(this.config.baseURL, endpoint);
    return this.request<T>('PUT', url, body, options);
  }

  /**
   * Make a DELETE request
   * @param endpoint - API endpoint
   * @param options - Request options
   * @returns Promise resolving to response data
   */
  async delete<T>(
    endpoint: string,
    options?: RequestOptions,
  ): Promise<T> {
    const url = RequestBuilder.buildEndpointUrl(this.config.baseURL, endpoint);
    return this.request<T>('DELETE', url, undefined, options);
  }

  /**
   * Make a PATCH request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param options - Request options
   * @returns Promise resolving to response data
   */
  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const url = RequestBuilder.buildEndpointUrl(this.config.baseURL, endpoint);
    return this.request<T>('PATCH', url, body, options);
  }

  /**
   * Make a streaming request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param options - Request options
   * @returns Stream of response chunks
   */
  async stream<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<Stream<T>> {
    const url = RequestBuilder.buildEndpointUrl(this.config.baseURL, endpoint);

    const headers = RequestBuilder.mergeHeaders(
      buildStreamingHeaders(this.config.apiKey, this.config.userAgent),
      options?.headers,
    );

    const requestInit = RequestBuilder.build('POST', url, {
      headers,
      body,
      timeout: options?.timeout || this.config.timeout,
      signal: options?.signal,
    });

    let response: Response;
    try {
      response = await fetch(url, requestInit);
    } finally {
      this.typeSafeCleanup(requestInit);
    }

    if (!response.ok) {
      try {
        await ResponseHandler.handle<unknown>(response);
      } catch (error) {
        console.error('Error response for streaming request:', error);
        throw error;
      }
    }

    if (!response.body) {
      throw new Error('No response body for streaming request');
    }

    const sseTransformer = (() => {
      let buffer = '';

      const emitEvent = (eventBlock: string, controller: TransformStreamDefaultController<T>) => {
        const normalizedEvent = eventBlock.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
        if (!normalizedEvent) {
          return false;
        }

        const dataLines = normalizedEvent
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trim());

        if (dataLines.length === 0) {
          return false;
        }

        const payload = dataLines.join('\n').trim();
        if (!payload) {
          return false;
        }

        if (payload === '[DONE]') {
          controller.terminate();
          return true;
        }

        try {
          controller.enqueue(JSON.parse(payload) as T);
        } catch (error) {
          console.warn('Malformed SSE event (enqueuing raw payload):', payload, error);
          controller.enqueue({ __raw: payload } as unknown as T);
        }

        return false;
      };

      return new TransformStream<string, T>({
        transform(chunk: string, controller) {
          buffer += chunk;

          const normalizedBuffer = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
          const events = normalizedBuffer.split('\n\n');
          buffer = events.pop() ?? '';

          for (const event of events) {
            if (emitEvent(event, controller)) {
              buffer = '';
              break;
            }
          }
        },
        flush(controller) {
          emitEvent(buffer, controller);
        },
      });
    })();

    const textStream = response.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(sseTransformer) as ReadableStream<T>;

    return createStream(textStream);
  }

  /**
   * Generic request method
   * @param method - HTTP method
   * @param url - Full URL
   * @param body - Request body
   * @param options - Request options
   * @returns Promise resolving to response data
   */
  private async request<T>(
    method: HttpMethod,
    url: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const retryConfig: Partial<RetryConfig> = {
      maxRetries: options?.signal ? 0 : this.config.maxRetries,
    };

    return withRetry(async () => {
      const headers = RequestBuilder.mergeHeaders(
        buildHeaders(this.config.apiKey, this.config.userAgent),
        options?.headers,
      );

      const requestInit = RequestBuilder.build(method, url, {
        headers,
        body,
        timeout: options?.timeout || this.config.timeout,
        signal: options?.signal,
      });

      let response: Response;
      try {
        response = await fetch(url, requestInit);
      } finally {
        this.typeSafeCleanup(requestInit);
      }

      return ResponseHandler.handle<T>(response);
    }, retryConfig);
  }
}
