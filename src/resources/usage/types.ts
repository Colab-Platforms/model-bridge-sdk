/**
 * Usage API types and interfaces
 */

/**
 * Usage record
 */
export interface UsageRecord {
  date: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  requests: number;
}

/**
 * Usage statistics
 */
export interface UsageStats {
  period: {
    startDate: string;
    endDate: string;
  };
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  models: UsageRecord[];
}

/**
 * Cost breakdown
 */
export interface CostBreakdown {
  period: {
    startDate: string;
    endDate: string;
  };
  totalCost: number;
  byModel: Array<{
    model: string;
    cost: number;
    percentage: number;
  }>;
  byType: Array<{
    type: string;
    cost: number;
    percentage: number;
  }>;
}

/**
 * Usage list response
 */
export interface UsageListResponse {
  data: UsageRecord[];
  total: number;
  limit: number;
  offset: number;
  stats: Partial<UsageStats>;
}
