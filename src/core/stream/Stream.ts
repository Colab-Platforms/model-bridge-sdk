/**
 * Stream class for handling streaming responses
 * Wraps ReadableStream and provides AsyncIterable interface
 */

/**
 * Stream wrapper for handling streaming responses from the API
 * Supports both ReadableStream and AsyncIterable interfaces
 */
export class Stream<Item> implements AsyncIterable<Item> {
  /**
   * The underlying ReadableStream
   */
  private reader: ReadableStreamDefaultReader<Item>;

  /**
   * Whether the stream is closed
   */
  private closed: boolean = false;

  /**
   * Creates a new Stream instance
   * @param readableStream - The underlying ReadableStream
   */
  constructor(readableStream: ReadableStream<Item>) {
    this.reader = readableStream.getReader();
  }

  /**
   * Async iterator protocol implementation
   */
  async *[Symbol.asyncIterator](): AsyncGenerator<Item, void, unknown> {
    try {
      while (!this.closed) {
        const { done, value } = await this.reader.read();

        if (done) {
          this.closed = true;
          break;
        }

        if (value !== undefined) {
          yield value;
        }
      }
    } finally {
      this.closed = true;
      this.reader.releaseLock();
    }
  }

  /**
   * Close the stream
   */
  async close(): Promise<void> {
    this.closed = true;
    await this.reader.cancel();
  }

  /**
   * Collect all stream items into an array
   * WARNING: This loads the entire stream into memory
   */
  async toArray(): Promise<Item[]> {
    const items: Item[] = [];
    for await (const item of this) {
      items.push(item);
    }
    return items;
  }

  /**
   * Get isClosed state
   */
  get isClosed(): boolean {
    return this.closed;
  }
}

/**
 * Helper function to create a Stream from a ReadableStream
 */
export function createStream<Item>(readableStream: ReadableStream<Item>): Stream<Item> {
  return new Stream(readableStream);
}
