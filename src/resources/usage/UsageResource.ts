/**
 * Usage Resource
 * Handles usage tracking and analytics operations
 */

import { HttpClient } from '../../http/HttpClient';

/**
 * Usage resource for tracking API usage and costs
 */
export class UsageResource {
  /**
   * Creates a new UsageResource instance
   * @param httpClient - HTTP client instance
   */
  constructor(private httpClient: HttpClient) {}

  /**
   * Get usage statistics for the current period
   * @returns Promise resolving to usage data
   */
  async getCurrent() {
    return this.httpClient.get('/usage/current');
  }

  /**
   * Get historical usage data
   * @param startDate - Start date (ISO 8601)
   * @param endDate - End date (ISO 8601)
   * @param limit - Maximum records to return
   * @param offset - Number of records to skip
   * @returns Promise resolving to usage history
   */
  async list(
    startDate?: string,
    endDate?: string,
    limit?: number,
    offset?: number,
  ) {
    return this.httpClient.get('/usage', {
      startDate,
      endDate,
      limit,
      offset,
    });
  }

  /**
   * Get usage by model
   * @param startDate - Start date (ISO 8601)
   * @param endDate - End date (ISO 8601)
   * @returns Promise resolving to usage by model
   */
  async byModel(startDate?: string, endDate?: string) {
    return this.httpClient.get('/usage/by-model', {
      startDate,
      endDate,
    });
  }

  /**
   * Get usage costs
   * @param startDate - Start date (ISO 8601)
   * @param endDate - End date (ISO 8601)
   * @returns Promise resolving to cost breakdown
   */
  async getCosts(startDate?: string, endDate?: string) {
    return this.httpClient.get('/usage/costs', {
      startDate,
      endDate,
    });
  }

  /**
   * Export usage report
   * @param format - Export format (csv, json)
   * @param startDate - Start date (ISO 8601)
   * @param endDate - End date (ISO 8601)
   * @returns Promise resolving to report data
   */
  async export(format: 'csv' | 'json', startDate?: string, endDate?: string) {
    return this.httpClient.get('/usage/export', {
      format,
      startDate,
      endDate,
    });
  }
}
