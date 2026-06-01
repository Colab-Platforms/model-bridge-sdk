/**
 * Chat Resource
 * Handles chat-related API operations
 */

import { HttpClient } from '../../http/HttpClient';
import { CompletionsResource } from './CompletionsResource';

/**
 * Chat resource for managing chat operations
 */
export class ChatResource {
  /**
   * Completions sub-resource
   */
  public completions: CompletionsResource;

  /**
   * Creates a new ChatResource instance
   * @param httpClient - HTTP client instance
   */
  constructor(private httpClient: HttpClient) {
    this.completions = new CompletionsResource(httpClient);
  }

  /**
   * List available chat models
   * @returns Promise resolving to list of models
   */
  async listModels() {
    return this.httpClient.get('/chat/models');
  }

  /**
   * Get model details
   * @param modelId - Model identifier
   * @returns Promise resolving to model details
   */
  async getModel(modelId: string) {
    return this.httpClient.get(`/chat/models/${modelId}`);
  }
}
