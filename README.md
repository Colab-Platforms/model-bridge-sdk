# ModelBridge SDK

A production-grade TypeScript SDK for the ModelBridge AI Gateway platform.

## Features

- 🚀 **Zero Dependencies** - Pure TypeScript implementation with no external dependencies
- 📡 **Fetch-Based Transport** - Works in Node.js, Browser, Cloudflare Workers, Edge Runtime, and more
- 🔄 **Streaming Support** - First-class support for streaming responses with AsyncIterable interface
- 🏗️ **Resource-Based Architecture** - Clean, intuitive API design inspired by the OpenAI SDK
- 🛡️ **Type-Safe** - Full TypeScript support with comprehensive type definitions
- ⚡ **Automatic Retries** - Built-in retry logic with exponential backoff
- 🔐 **Error Handling** - Comprehensive error hierarchy with specialized error types
- 📦 **ESM & CommonJS** - Dual module support for maximum compatibility

## Installation

```bash
npm install @model-bridge/sdk
```

## Quick Start

```typescript
import { ModelBridge } from '@model-bridge/sdk';

// Initialize the client
const client = new ModelBridge({
  apiKey: process.env.MODELBRIDGE_API_KEY,
});

// Make a chat completion request
const response = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'user', content: 'Hello!' },
  ],
});

console.log(response.choices[0].message.content);
```

## Usage Examples

### Chat Completions

```typescript
// Regular completion
const completion = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is TypeScript?' },
  ],
  temperature: 0.7,
  maxTokens: 1000,
});

// Streaming completion
const stream = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Write a poem about TypeScript' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0].delta.content || '');
}
```

### Models

```typescript
// List available models
const models = await client.models.list();

// Get model details
const model = await client.models.retrieve('gpt-4');

// Get pricing information
const pricing = await client.models.getPricing('gpt-4');
```

### Usage & Credits

```typescript
// Get current credit balance
const balance = await client.credits.balance();
console.log(`Available credits: ${balance.available}`);

// Get usage statistics
const usage = await client.usage.getCurrent();
console.log(`Total tokens used: ${usage.totalTokens}`);

// Get usage by model
const modelUsage = await client.usage.byModel('2024-01-01', '2024-01-31');
```

## Configuration

```typescript
const client = new ModelBridge({
  apiKey: process.env.MODELBRIDGE_API_KEY,
  baseURL: 'https://api.modelbridge.ai/v1', // Optional: defaults to official API
  timeout: 30000, // Optional: timeout in milliseconds
  maxRetries: 3, // Optional: number of retries for failed requests
  dangerouslyAllowBrowser: false, // Optional: allow usage in browser environment
});
```

## Error Handling

The SDK provides specialized error types for different scenarios:

```typescript
import {
  ApiError,
  AuthenticationError,
  RateLimitError,
  InsufficientCreditsError,
  ProviderError,
  ValidationError,
} from '@model-bridge/sdk';

try {
  await client.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello' }],
  });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error('Rate limited. Retry after:', error.retryAfter, 'seconds');
  } else if (error instanceof InsufficientCreditsError) {
    console.error('Insufficient credits:', {
      required: error.required,
      available: error.available,
    });
  } else if (error instanceof ProviderError) {
    console.error('Provider error:', error.provider);
  } else if (error instanceof ValidationError) {
    console.error('Validation errors:', error.validationErrors);
  } else if (error instanceof ApiError) {
    console.error('API error:', error.message);
  }
}
```

## Streaming

The SDK has first-class support for streaming responses:

```typescript
// Stream chat completions
const stream = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true,
});

// Iterate over stream chunks
for await (const chunk of stream) {
  const content = chunk.choices[0].delta.content;
  if (content) {
    process.stdout.write(content);
  }
}

// Or collect all chunks
const allChunks = await stream.toArray();
```

## Environment Support

The SDK works in multiple JavaScript environments:

- **Node.js** (18+)
- **Browser** (modern)
- **Cloudflare Workers**
- **Vercel Edge Runtime**
- **Bun**
- **Deno**

## Architecture

### Dependency Flow

The SDK follows a strict dependency hierarchy to prevent circular dependencies:

```
Resources
    ↓
Core (Types, Errors, Config)
    ↓
HTTP (HttpClient, RequestBuilder, ResponseHandler)
    ↓
Fetch API
```

### Resources

- **Chat** - Chat completions and related operations
- **Models** - Model information and availability
- **Usage** - Usage tracking and analytics
- **Credits** - Credit balance and management
- **Images** - Image generation (placeholder for future)
- **Audio** - Audio operations (placeholder for future)
- **Video** - Video operations (placeholder for future)
- **Research** - Research operations (placeholder for future)

## Advanced Usage

### Custom HTTP Configuration

```typescript
// Use custom timeout per request
const completion = await client.chat.completions.create(
  {
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello' }],
  },
  { timeout: 60000 } // 60 seconds
);

// Use AbortController
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const completion = await client.chat.completions.create(
    { /* config */ },
    { signal: controller.signal }
  );
} finally {
  clearTimeout(timeoutId);
}
```

### Retry Configuration

The SDK automatically retries on:
- Rate limit errors (429)
- Service unavailable errors (503)
- Network timeouts
- Retryable provider errors

Retries use exponential backoff with jitter to prevent thundering herd.

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  ChatCompletionRequest,
  ChatCompletion,
  ChatCompletionChunk,
  Model,
  CreditBalance,
  UsageStats,
} from '@model-bridge/sdk';

const request: ChatCompletionRequest = {
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello' }],
};
```

## Performance

The SDK is optimized for performance:

- No external dependencies (zero overhead)
- Native fetch-based HTTP client
- Connection reuse through standard HTTP
- Streaming support for large responses
- Efficient error handling

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

- 📖 [Documentation](https://docs.modelbridge.ai)
- 💬 [Discord Community](https://discord.gg/modelbridge)
- 🐛 [Bug Reports](https://github.com/modelbridge/sdk-typescript/issues)
- 💡 [Feature Requests](https://github.com/modelbridge/sdk-typescript/discussions)
