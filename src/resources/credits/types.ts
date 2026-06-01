/**
 * Credits API types and interfaces
 */

/**
 * Credit transaction
 */
export interface CreditTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'transfer' | 'refund' | 'adjustment';
  amount: number;
  balance: number;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

/**
 * Credit transfer
 */
export interface CreditTransfer {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

/**
 * Auto-replenishment configuration
 */
export interface AutoReplenishConfig {
  enabled: boolean;
  threshold: number;
  amount: number;
  paymentMethodId: string;
  lastRun?: string;
  nextRun?: string;
}

/**
 * Payment method
 */
export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_account' | 'wire_transfer';
  isDefault: boolean;
  lastFour?: string;
  expiryDate?: string;
  status: 'active' | 'inactive' | 'expired';
}

/**
 * Credits history response
 */
export interface CreditsHistoryResponse {
  data: CreditTransaction[];
  total: number;
  limit: number;
  offset: number;
}
