/**
 * Credits Resource
 * Handles credit balance and operations
 */

import { HttpClient } from '../../http/HttpClient';
import { CreditBalance } from '../../core/types/gateway';

/**
 * Credits resource for managing account credits
 */
export class CreditsResource {
  /**
   * Creates a new CreditsResource instance
   * @param httpClient - HTTP client instance
   */
  constructor(private httpClient: HttpClient) {}

  /**
   * Get current credit balance
   * @returns Promise resolving to credit balance information
   */
  async balance(): Promise<CreditBalance> {
    return this.httpClient.get('/credits/balance');
  }

  /**
   * Get credit history
   * @param limit - Maximum records to return
   * @param offset - Number of records to skip
   * @returns Promise resolving to credit history
   */
  async history(limit?: number, offset?: number) {
    return this.httpClient.get('/credits/history', { limit, offset });
  }

  /**
   * Add credits to account (requires payment method on file)
   * @param amount - Amount of credits to add
   * @param paymentMethodId - Payment method identifier
   * @returns Promise resolving to transaction details
   */
  async add(amount: number, paymentMethodId?: string) {
    return this.httpClient.post('/credits/add', {
      amount,
      paymentMethodId,
    });
  }

  /**
   * Transfer credits to another account
   * @param recipientId - Recipient user ID
   * @param amount - Amount of credits to transfer
   * @returns Promise resolving to transfer confirmation
   */
  async transfer(recipientId: string, amount: number) {
    return this.httpClient.post('/credits/transfer', {
      recipientId,
      amount,
    });
  }

  /**
   * Set up automatic credit replenishment
   * @param threshold - Credit balance threshold to trigger replenishment
   * @param amount - Amount to replenish when threshold is reached
   * @returns Promise resolving to replenishment configuration
   */
  async setupAutoReplenish(threshold: number, amount: number) {
    return this.httpClient.post('/credits/auto-replenish', {
      threshold,
      amount,
    });
  }

  /**
   * Get available payment methods
   * @returns Promise resolving to list of payment methods
   */
  async getPaymentMethods() {
    return this.httpClient.get('/credits/payment-methods');
  }
}
