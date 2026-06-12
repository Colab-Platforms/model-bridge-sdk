/**
 * Models Resource
 * Handles model listing and information operations
 */

import { HttpClient } from '../../http/HttpClient';
import { Model } from '../../core/types/gateway';

/**
 * Models resource for retrieving model information
 */
export class ModelsResource {
  /**
   * Creates a new ModelsResource instance
   * @param httpClient - HTTP client instance
   */
  constructor(private httpClient: HttpClient) {}

  /**
   * List available models
   * @param limit - Maximum number of models to return
   * @param offset - Number of models to skip
   * @returns Promise resolving to list of models
   */
  async list(limit?: number, offset?: number) {
    return this.httpClient.get('/models', { limit, offset });
  }

  /**
   * Get details for a specific model
   * @param modelId - Model identifier
   * @returns Promise resolving to model details
   */
  async retrieve(modelId: string): Promise<Model> {
    return this.httpClient.get(`/models/${modelId}`);
  }

  /**
   * List models by type
   * @param type - Model type (chat, completion, embedding, etc.)
   * @returns Promise resolving to filtered list of models
   */
  async listByType(type: string) {
    return this.httpClient.get('/models', { type });
  }

  /**
   * Get model pricing information
   * @param modelId - Model identifier
   * @returns Promise resolving to pricing details
   */
  async getPricing(modelId: string) {
    return this.httpClient.get(`/models/${modelId}/pricing`);
  }
}
