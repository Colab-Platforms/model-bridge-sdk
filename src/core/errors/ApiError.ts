/**
 * Base API Error class
 * All ModelBridge SDK errors inherit from this class
 */
export class ApiError extends Error {
  /**
   * HTTP status code
   */
  public status: number;

  /**
   * Machine-readable error code
   */
  public code: string;

  /**
   * Request ID for debugging
   */
  public requestId?: string;

  /**
   * Additional error details
   */
  public details?: Record<string, unknown>;

  /**
   * Raw HTTP response headers
   */
  public headers?: Record<string, string>;

  /**
   * Creates a new ApiError instance
   * @param message - Human-readable error message
   * @param status - HTTP status code
   * @param code - Machine-readable error code
   * @param options - Additional error options
   */
  constructor(
    message: string,
    status: number,
    code: string,
    options?: {
      requestId?: string;
      details?: Record<string, unknown>;
      headers?: Record<string, string>;
    },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.requestId = options?.requestId;
    this.details = options?.details;
    this.headers = options?.headers;

    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Get error information as object
   */
  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      requestId: this.requestId,
      details: this.details,
    };
  }
}
