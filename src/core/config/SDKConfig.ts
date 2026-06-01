/**
 * SDK Configuration
 * Manages SDK-wide configuration and defaults
 */
import { SDKConfigType } from '../types/gateway';

/**
 * SDK Configuration class
 * Handles default settings and configuration validation
 */
export class SDKConfig {
  /**
   * API key for authentication
   */
  public readonly apiKey: string;

  /**
   * Base URL for API endpoints
   */
  public readonly baseURL: string;

  /**
   * Request timeout in milliseconds
   */
  public readonly timeout: number;

  /**
   * Maximum number of retries for failed requests
   */
  public readonly maxRetries: number;

  /**
   * Custom User-Agent header
   */
  public readonly userAgent: string;

  /**
   * Whether to allow SDK usage in browser environment
   */
  public readonly dangerouslyAllowBrowser: boolean;

  /**
   * SDK version
   */
  public readonly sdkVersion: string = '1.0.0';

  /**
   * Creates a new SDKConfig instance
   * @param config - Configuration options
   * @throws Error if apiKey is not provided
   */
  constructor(config: SDKConfigType) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || this.getDefaultBaseURL();
    this.timeout = config.timeout || 30000; // 30 seconds
    this.maxRetries = config.maxRetries ?? 3;
    this.userAgent = config.userAgent || this.getDefaultUserAgent();
    this.dangerouslyAllowBrowser = config.dangerouslyAllowBrowser || false;

    this.validateConfig();
  }

  private getDefaultBaseURL(): string {
    // return 'https://api.modelbridge.ai/v1';
    return "https://jsonplaceholder.typicode.com/";
  }


  private getDefaultUserAgent(): string {
    const runtime = this.getRuntime();
    return `ModelBridge SDK/${this.sdkVersion} (${runtime})`;
  }

  /**
   * Detect runtime environment
   */
  private getRuntime(): string {
    if (typeof (globalThis as any).Deno !== 'undefined') {
      return 'Deno';
    }
    if (typeof (globalThis as any).Bun !== 'undefined') {
      return 'Bun';
    }

    if (typeof (globalThis as any).EdgeRuntime !== 'undefined') {
      return 'Edge Runtime';
    }
    if (typeof process !== 'undefined' && (process as any).versions?.node) {
      return `Node.js/${(process as any).versions.node}`;
    }
    if (typeof globalThis.window !== 'undefined') {
      return 'Browser';
    }
    return 'Unknown';
  }


  private validateConfig(): void {
    if (this.timeout <= 0) {
      throw new Error('Timeout must be greater than 0');
    }

    if (this.maxRetries < 0) {
      throw new Error('Max retries must be greater than or equal to 0');
    }

    // Warn if running in browser without explicit permission
    if (typeof globalThis.window !== 'undefined' && !this.dangerouslyAllowBrowser) {
      console.warn(
        'ModelBridge SDK is running in a browser. This is not recommended for production use. ' +
          'Set `dangerouslyAllowBrowser: true` to suppress this warning.',
      );
    }
  }

  /**
   * Get configuration as plain object
   */
  public toJSON() {
    return {
      apiKey: `${this.apiKey.substring(0, 7)}...${this.apiKey.substring(this.apiKey.length - 4)}`,
      baseURL: this.baseURL,
      timeout: this.timeout,
      maxRetries: this.maxRetries,
      userAgent: this.userAgent,
      dangerouslyAllowBrowser: this.dangerouslyAllowBrowser,
    };
  }
}
