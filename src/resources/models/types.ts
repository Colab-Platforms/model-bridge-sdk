/**
 * Models API types and interfaces
 */

/**
 * Model type enumeration
 */
export type ModelType = 'chat' | 'completion' | 'embedding' | 'image' | 'audio' | 'video';

/**
 * Model pricing information
 */
export interface ModelPricing {
  inputCostPerMToken: number;
  outputCostPerMToken: number;
  currency: string;
}

/**
 * Extended model information
 */
export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  type: ModelType;
  maxTokens: number;
  contextWindow: number;
  pricing: ModelPricing;
  status: 'available' | 'deprecated' | 'maintenance';
  releaseDate: string;
  description?: string;
  capabilities?: string[];
}

/**
 * Model list response
 */
export interface ModelListResponse {
  data: ModelInfo[];
  total: number;
  limit: number;
  offset: number;
}
