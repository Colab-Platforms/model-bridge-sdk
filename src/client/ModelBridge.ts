/**
 * ModelBridge SDK Client
 * Main entry point for the ModelBridge SDK
 */

import { SDKConfig } from '../core/config/SDKConfig';
import { SDKConfigType } from '../core/types/gateway';
import { HttpClient } from '../http/HttpClient';
import { ChatResource } from '../resources/chat/ChatResource';
import { ModelsResource } from '../resources/models/ModelsResource';
import { UsageResource } from '../resources/usage/UsageResource';
import { CreditsResource } from '../resources/credits/CreditsResource';
export class ModelBridge {
  /**
   * SDK configuration
   */
  private config: SDKConfig;

  /**
   * HTTP client instance
   */
  private httpClient: HttpClient;

  /**
   * Chat resource
   */
  public chat: ChatResource;

  /**
   * Models resource
   */
  public models: ModelsResource;

  /**
   * Usage resource
   */
  public usage: UsageResource;

  /**
   * Credits resource
   */
  public credits: CreditsResource;

  /**
   * Creates a new ModelBridge SDK instance
   *
   * @param config - SDK configuration
   * @throws Error if configuration is invalid
   *
   * @example
   * ```typescript
   * const client = new ModelBridge({
   *   apiKey: 'sk-your-api-key',
   *   timeout: 30000,
   *   maxRetries: 3,
   * });
   * ```
   */
  constructor(config: SDKConfigType) {
    // Initialize configuration
    this.config = new SDKConfig(config);

    // Initialize HTTP client
    this.httpClient = new HttpClient(this.config);

    // Initialize all resources
    this.chat = new ChatResource(this.httpClient);
    this.models = new ModelsResource(this.httpClient);
    this.usage = new UsageResource(this.httpClient);
    this.credits = new CreditsResource(this.httpClient);
  }

  /**
   * Get SDK version
   */
  static get version(): string {
    return '1.0.0';
  }

  public getConfig() {
    return this.config.toJSON();
  }

  /**
   * Close the client and clean up resources
   * This is optional but recommended for long-running processes
   */

  
  public close(): void {
    // Placeholder for cleanup logic
    // In future versions, this may handle connection pooling cleanup, etc.
  }
}
