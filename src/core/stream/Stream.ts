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
  private readonly readableStream: ReadableStream<Item>;

  /**
   * Whether the stream is closed
   */
  private closed: boolean = false;

  /**
   * Active reader while the stream is being consumed
   */
  private activeReader: ReadableStreamDefaultReader<Item> | null = null;

  /**
   * Creates a new Stream instance
   * @param readableStream - The underlying ReadableStream
   */
  constructor(readableStream: ReadableStream<Item>) {
    this.readableStream = readableStream;
  }

  /**
   * Async iterator protocol implementation
   */
  async *[Symbol.asyncIterator](): AsyncGenerator<Item, void, unknown> {
    const reader = this.readableStream.getReader();
    this.activeReader = reader;

    try {
      while (!this.closed) {
        const { done, value } = await reader.read();

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
      this.activeReader = null;
      reader.releaseLock();
    }
  }

  /**
   * Close the stream
   */
  async close(): Promise<void> {
    this.closed = true;
    const reader = this.activeReader ?? this.readableStream.getReader();

    try {
      await reader.cancel();
    } finally {
      if (reader === this.activeReader) {
        this.activeReader = null;
      } else {
        reader.releaseLock();
      }
    }
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
