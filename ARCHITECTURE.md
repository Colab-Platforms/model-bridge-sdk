# ModelBridge SDK Architecture

## Overview

The ModelBridge SDK is a production-grade TypeScript SDK designed with clean architecture principles, SOLID design patterns, and a resource-based API design inspired by the OpenAI SDK.

## Design Principles

### 1. Clean Architecture

The SDK enforces strict separation of concerns with a clear dependency hierarchy:

```
┌─────────────────────────────────────┐
│   Public API (index.ts)             │
├─────────────────────────────────────┤
│   Client (ModelBridge)              │ ← User entry point
├─────────────────────────────────────┤
│   Resources                         │ ← Domain logic
│   (Chat, Models, Usage, Credits)    │
├─────────────────────────────────────┤
│   Core                              │ ← Types, Errors, Config
│   (Types, Errors, Config, Stream)   │
├─────────────────────────────────────┤
│   HTTP Layer                        │ ← Transport
│   (HttpClient, RequestBuilder,      │
│    ResponseHandler)                 │
├─────────────────────────────────────┤
│   Utils                             │ ← Helpers
│   (Retry, Headers, Validation)      │
├─────────────────────────────────────┤
│   Fetch API                         │ ← Native HTTP
└─────────────────────────────────────┘
```

### 2. Dependency Flow

Resources depend on Core and HTTP, but **never** on each other:

```
Resources ──→ Core ──→ HTTP ──→ Fetch
    ↓
(No circular dependencies)
```

### 3. Resource-Based Design

The API is organized by resources, not by HTTP verbs:

```typescript
// Good: Resource-based
client.chat.completions.create()
client.models.list()
client.credits.balance()

// Avoid: Verb-based
client.createCompletion()
client.listModels()
client.getCredits()
```

## Module Structure

### `/src/client`

**Responsibility**: SDK entry point

- `ModelBridge.ts` - Main client class
  - Initializes all resources
  - Manages SDK lifecycle
  - Exposes public API

```typescript
const client = new ModelBridge({ apiKey: '...' });
client.chat.completions.create(...)
```

### `/src/resources`

**Responsibility**: Domain logic and API operations

Each resource encapsulates related operations:

- `chat/` - Chat completions API
  - `ChatResource.ts` - Chat domain operations
  - `CompletionsResource.ts` - Completion operations
  - `types.ts` - Type definitions

- `models/` - Model information API
  - `ModelsResource.ts` - Model operations
  - `types.ts` - Model types

- `usage/` - Usage tracking API
  - `UsageResource.ts` - Usage operations
  - `types.ts` - Usage types

- `credits/` - Credit management API
  - `CreditsResource.ts` - Credit operations
  - `types.ts` - Credit types

- `images/`, `audio/`, `video/`, `research/` - Future capabilities (placeholder)

### `/src/core`

**Responsibility**: Core functionality, types, and configuration

- `config/SDKConfig.ts` - SDK configuration management
  - Validates configuration
  - Provides defaults
  - Manages runtime detection

- `errors/` - Error hierarchy
  - `ApiError.ts` - Base error class
  - `AuthenticationError.ts` - 401 errors
  - `RateLimitError.ts` - 429 errors
  - `InsufficientCreditsError.ts` - 402 errors
  - `ProviderError.ts` - Provider errors (502/503)
  - `ValidationError.ts` - 400 errors

- `stream/` - Streaming support
  - `Stream.ts` - Wraps ReadableStream with AsyncIterable
  - `SSEParser.ts` - Server-Sent Events parser

- `types/` - Type definitions
  - `common.ts` - Common types (ApiResponse, RequestOptions, etc.)
  - `gateway.ts` - Gateway-specific types (Model, Account, etc.)
  - `responses.ts` - Response wrapper types

### `/src/http`

**Responsibility**: HTTP transport layer

- `HttpClient.ts` - Central HTTP client
  - Executes all fetch requests
  - Handles retries
  - Manages timeouts
  - Delegates error mapping

- `RequestBuilder.ts` - Request construction
  - Builds fetch RequestInit objects
  - Constructs URLs with query parameters
  - Merges headers
  - Validates HTTP methods

- `ResponseHandler.ts` - Response processing
  - Parses response bodies
  - Maps HTTP status codes to errors
  - Extracts metadata
  - Handles content types

### `/src/utils`

**Responsibility**: Utility functions

- `retry.ts` - Retry logic
  - Exponential backoff with jitter
  - Retryable error detection
  - `withRetry` helper function

- `headers.ts` - HTTP header utilities
  - Build default headers
  - Extract rate limit info
  - Normalize header names

- `validation.ts` - Input validation
  - Field validation helpers
  - Batch validation
  - Type-safe validators

## Design Patterns

### 1. Resource Pattern

Each API domain is represented as a Resource class:

```typescript
class ChatResource {
  constructor(private httpClient: HttpClient) {}
  
  async create(request: ChatCompletionRequest) {
    return this.httpClient.post('/chat/completions', request);
  }
}
```

**Benefits**:
- Clear separation of concerns
- Easy to extend with new resources
- Intuitive API organization
- Type-safe method signatures

### 2. Error Hierarchy

Specialized error types enable precise error handling:

```typescript
try {
  // ...
} catch (error) {
  if (error instanceof RateLimitError) {
    // Handle rate limit
  } else if (error instanceof InsufficientCreditsError) {
    // Handle credits
  }
}
```

**Benefits**:
- Precise error handling
- Hierarchical catch blocks
- Extensible error system

### 3. Stream Wrapper

ReadableStream wrapped in an AsyncIterable interface:

```typescript
class Stream<Item> implements AsyncIterable<Item> {
  async *[Symbol.asyncIterator]() {
    // ...
  }
}
```

**Benefits**:
- Standard async iteration (`for await`)
- Backward compatible with ReadableStream
- Memory-efficient for large responses
- Type-safe streaming

### 4. Configuration Validation

Configuration validated at SDK initialization:

```typescript
class SDKConfig {
  constructor(config: SDKConfigType) {
    this.validateConfig(); // Validates at init time
  }
  
  private validateConfig() {
    // Runtime validation
  }
}
```

**Benefits**:
- Fail fast on invalid config
- Clear error messages
- Single point of validation

### 5. Retry with Exponential Backoff

Automatic retry logic with intelligent backoff:

```typescript
export async function withRetry<T>(
  fn: () => Promise<T>,
  config?: Partial<RetryConfig>,
): Promise<T> {
  // Exponential backoff + jitter
  // Respects rate limit headers
  // Only retries specific errors
}
```

**Benefits**:
- Transparent retry handling
- Prevents thundering herd
- Respects rate limits
- Configurable behavior

## Type System

### No `any` Policy

All code uses strict TypeScript with no `any` types:

- Full type coverage
- Compile-time error detection
- IDE autocompletion
- Self-documenting code

### Generic Types

The SDK uses generics for flexibility:

```typescript
// HttpClient methods are generic
async get<T>(endpoint: string): Promise<T>

// Resources use specific types
async create(request: ChatCompletionRequest): Promise<ChatCompletion>
```

### Discriminated Unions

Error responses use discriminated unions:

```typescript
type ApiResponseResult<T> = SuccessResponse<T> | ErrorResponse;
```

## Error Handling Strategy

### HTTP Status Code Mapping

| Status | Error Type | Details |
|--------|-----------|---------|
| 400 | `ValidationError` | Input validation failures |
| 401 | `AuthenticationError` | Invalid/missing credentials |
| 402 | `InsufficientCreditsError` | Out of credits |
| 429 | `RateLimitError` | Rate limit exceeded |
| 502 | `ProviderError` | Provider error (non-retryable) |
| 503 | `ProviderError` | Provider error (retryable) |
| Other | `ApiError` | Generic API errors |

### Retry Strategy

**Automatically Retried**:
- Rate limit errors (429)
- Service unavailable (503)
- Network timeouts
- Retryable provider errors

**Not Retried**:
- Authentication errors (401)
- Validation errors (400)
- Insufficient credits (402)
- Non-retryable errors

## Environment Compatibility

The SDK works in multiple runtimes without code changes:

- **Node.js** (18+) - Native `fetch` available
- **Browser** - Native `fetch` API
- **Cloudflare Workers** - Runtime `fetch`
- **Vercel Edge** - Runtime `fetch`
- **Bun** - Native `fetch`
- **Deno** - Native `fetch`

**Runtime Detection**:

```typescript
private getRuntime(): string {
  if (typeof Deno !== 'undefined') return 'Deno';
  if (typeof Bun !== 'undefined') return 'Bun';
  if (typeof EdgeRuntime !== 'undefined') return 'Edge Runtime';
  if (typeof process?.versions?.node) return `Node.js/${process.versions.node}`;
  if (typeof window !== 'undefined') return 'Browser';
  return 'Unknown';
}
```

## Extensibility

### Adding New Resources

1. Create resource directory: `src/resources/newresource/`
2. Create resource class: `NewResource.ts`
3. Create types: `types.ts`
4. Create index: `index.ts`
5. Add to `ModelBridge` class

```typescript
// In ModelBridge.ts
public newresource: NewResource;

constructor(config: SDKConfigType) {
  // ...
  this.newresource = new NewResource(this.httpClient);
}
```

### Adding New Error Types

1. Create error class extending `ApiError`
2. Add to error handling in `ResponseHandler`
3. Export from `core/index.ts`

```typescript
class NewError extends ApiError {
  constructor(message: string, options?) {
    super(message, 400, 'NEW_ERROR', options);
    this.name = 'NewError';
  }
}
```

## Performance Considerations

### No External Dependencies

The SDK has **zero dependencies** by design:
- Smaller bundle size
- Fewer security vulnerabilities
- Faster npm install

### Native Fetch

Uses native `fetch` API:
- Connection pooling (built-in)
- Efficient resource usage
- Standard behavior

### Streaming Support

First-class streaming support for:
- Memory efficiency with large responses
- Progressive data processing
- Real-time feedback

### Retry Optimization

Exponential backoff prevents:
- Thundering herd problem
- Server overload
- Wasted requests

## Security

### API Key Handling

- Never logged in full
- Masked in debug output
- Validated at initialization
- Used only in Authorization header

### Environment Support

- Warns when used in browser (without explicit opt-in)
- Requires explicit flag: `dangerouslyAllowBrowser: true`

### No Hardcoded Credentials

- All configuration via constructor
- Environment variables via `process.env`
- No default credentials

## Future Extensibility

The architecture supports future additions:

- New AI capabilities (images, audio, video, research)
- New error types
- New streaming formats
- New authentication methods
- Custom retry strategies

## Summary

The ModelBridge SDK is built on solid architectural principles:

✅ **Clean Architecture** - Clear separation of concerns
✅ **Type Safety** - Full TypeScript coverage
✅ **Error Handling** - Comprehensive error hierarchy
✅ **Streaming** - First-class async support
✅ **Retry Logic** - Intelligent backoff
✅ **Extensibility** - Easy to extend
✅ **Performance** - Zero dependencies, native APIs
✅ **Environment Support** - Works everywhere
✅ **Security** - Safe credential handling
✅ **Developer Experience** - Intuitive, well-documented API
