/**
 * Completions Resource
 * Handles chat completion operations
 */

import { HttpClient } from '../../http/HttpClient';
import { Stream } from '../../core/stream/Stream';
import {
  ChatCompletionRequest,
  ChatCompletion,
  ChatCompletionChunk,
  CreateCompletionRequest,
  Completion,
  CompletionChunk,
} from './types';

/**
 * Completions resource for chat completion operations
 */
export class CompletionsResource {
  /**
   * Creates a new CompletionsResource instance
   * @param httpClient - HTTP client instance
   */
  constructor(private httpClient: HttpClient) {}

  /**
   * Create a chat completion
   * @param request - Chat completion request
   * @returns Promise resolving to chat completion or stream
   */
  async create(
    request: ChatCompletionRequest,
  ): Promise<ChatCompletion | Stream<ChatCompletionChunk>> {
    if (request.stream) {
      return this.httpClient.stream<ChatCompletionChunk>('/chat/completions', request);
    }

    return this.httpClient.post<ChatCompletion>('/chat/completions', request);
  }

  /**
   * Create a text completion (legacy endpoint)
   * @param request - Completion request
   * @returns Promise resolving to completion or stream
   */
  async createCompletion(
    request: CreateCompletionRequest,
  ): Promise<Completion | Stream<CompletionChunk>> {
    if (request.stream) {
      return this.httpClient.stream<CompletionChunk>('/completions', request);
    }

    return this.httpClient.post<Completion>('/completions', request);
  }

  /**
   * Count tokens for a message or prompt
   * @param model - Model identifier
   * @param messages - Chat messages or text prompt
   * @returns Promise resolving to token count
   */
  async countTokens(
    model: string,
    messages: unknown[],
  ): Promise<{ tokenCount: number }> {
    return this.httpClient.post('/chat/completions/tokens', {
      model,
      messages,
    });
  }
}
