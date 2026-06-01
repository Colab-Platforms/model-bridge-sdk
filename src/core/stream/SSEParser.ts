/**
 * Server-Sent Events (SSE) parser
 * Handles parsing of SSE stream format into structured events
 */

/**
 * Parsed SSE event
 */
export interface SSEEvent {
  event: string;
  data: string;
  id?: string;
  retry?: number;
}

/**
 * Parser for Server-Sent Events format
 */
export class SSEParser {
  /**
   * Parse a stream of text into SSE events
   * @param textStream - ReadableStream<string> containing SSE formatted data
   * @returns AsyncGenerator yielding parsed SSE events
   */
  static async *parse(textStream: ReadableStream<string>): AsyncGenerator<SSEEvent> {
    const reader = textStream.getReader();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (value) {
          buffer += value;
        }

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';   
        for (const line of lines) {
          const event = SSEParser.parseLine(line);
          if (event) {
            yield event;
          }
        }

        if (done) {
          // Process any remaining buffer
          if (buffer.trim()) {
            const event = SSEParser.parseLine(buffer);
            if (event) {
              yield event;
            }
          }
          break;
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Parse a single SSE line
   * @param line - A line from SSE stream
   * @returns Parsed SSE event or null if line is not a complete event
   */
  private static parseLine(line: string): SSEEvent | null {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith(':')) {
      return null;
    }

    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) {
      // Line is just a field name with no value
      return null;
    }

    const field = trimmedLine.substring(0, colonIndex);
    let value = trimmedLine.substring(colonIndex + 1);

    // Remove leading space from value if present
    if (value.startsWith(' ')) {
      value = value.substring(1);
    }

    // Parse based on field name
    switch (field) {
      case 'event':
      case 'data':
      case 'id':
        return { event: '', data: '', [field]: value };
      case 'retry':
        return { event: '', data: '', retry: parseInt(value, 10) };
      default:
        return null;
    }
  }

  /**
   * Create a ReadableStream from JSON lines, converting each line to an SSE event
   * @param jsonLines - Array of JSON strings
   * @returns ReadableStream<string> in SSE format
   */
  static jsonToSSEStream(jsonLines: string[]): ReadableStream<string> {
    let index = 0;

    return new ReadableStream({
      pull(controller) {
        if (index < jsonLines.length) {
          const line = jsonLines[index++];
          controller.enqueue(`data: ${line}\n\n`);
        } else {
          controller.close();
        }
      },
    });
  }
}
