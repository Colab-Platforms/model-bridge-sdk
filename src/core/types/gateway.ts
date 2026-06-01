/**
 * ModelBridge Gateway-specific types and interfaces
 */

/**
 * Supported AI models in the gateway
 */
export interface Model {
  id: string;
  name: string;
  provider: string;
  type: 'chat' | 'completion' | 'embedding' | 'image' | 'audio' | 'video';
  maxTokens: number;
  costPerMToken: {
    input: number;
    output: number;
  };
  status: 'available' | 'deprecated' | 'maintenance';
  releaseDate?: string;
  description?: string;
}

/**
 * User account information and credits
 */
export interface Account {
  userId: string;
  email: string;
  status: 'active' | 'suspended' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

/**
 * Credit balance and usage information
 */
export interface CreditBalance {
  total: number;
  available: number;
  reserved: number;
  currency: string;
  lastUpdated: string;
  resetDate?: string;
}

/**
 * Provider error response from ModelBridge
 */
export interface ProviderErrorResponse {
  provider: string;
  status: number;
  errorCode: string;
  errorMessage: string;
  timestamp: string;
  retryable: boolean;
}

/**
 * Request rate limit information
 */
export interface RateLimitInfo {
  requestsPerMinute: number;
  requestsPerHour: number;
  tokensPerMinute?: number;
  remaining: {
    requestsPerMinute: number;
    requestsPerHour: number;
    tokensPerMinute?: number;
  };
  resetAt: string;
}

/**
 * SDK configuration type
 */
export interface SDKConfigType {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
  userAgent?: string;
  dangerouslyAllowBrowser?: boolean;
}
