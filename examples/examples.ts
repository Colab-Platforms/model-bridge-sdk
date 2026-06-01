/**
 * ModelBridge SDK Usage Examples
 * 
 * This file demonstrates various usage patterns for the ModelBridge SDK.
 */

import { ModelBridge } from '@model-bridge/sdk';
import {
  AuthenticationError,
  RateLimitError,
  InsufficientCreditsError,
  ProviderError,
  ValidationError,
  ApiError,
} from '@model-bridge/sdk';

// Initialize the SDK
const client = new ModelBridge({
  apiKey: process.env.MODELBRIDGE_API_KEY || 'sk-your-api-key',
  timeout: 30000,
  maxRetries: 3,
});

// Example 1: Basic Chat Completion
async function basicChatCompletion() {
  console.log('Example 1: Basic Chat Completion');

  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'user',
        content: 'What is the capital of France?',
      },
    ],
    temperature: 0.7,
    maxTokens: 100,
  });

  console.log('Response:', response.choices[0].message.content);
}

// Example 2: Streaming Chat Completion
async function streamingChatCompletion() {
  console.log('\nExample 2: Streaming Chat Completion');

  const stream = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'user',
        content: 'Write a short poem about TypeScript',
      },
    ],
    stream: true,
  });

  // Process stream chunks
  for await (const chunk of stream) {
    const content = chunk.choices[0].delta.content;
    if (content) {
      process.stdout.write(content);
    }
  }
  console.log('\n');
}

// Example 3: Streaming with Error Handling
async function streamingWithErrorHandling() {
  console.log('\nExample 3: Streaming with Error Handling');

  try {
    const stream = await client.chat.completions.create(
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        stream: true,
      },
      { timeout: 10000 }, // Custom timeout
    );

    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0].delta.content || '');
    }
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.error('Rate limited. Retry after:', error.retryAfter, 'seconds');
    } else if (error instanceof InsufficientCreditsError) {
      console.error('Insufficient credits', {
        required: error.required,
        available: error.available,
      });
    } else if (error instanceof ProviderError) {
      console.error('Provider error:', error.provider);
    }
  }
}

// Example 4: Chat with System Prompt and Tools
async function chatWithTools() {
  console.log('\nExample 4: Chat with Tools');

  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant with access to tools.',
      },
      {
        role: 'user',
        content: 'Get the weather for New York',
      },
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'get_weather',
          description: 'Get the weather for a location',
          parameters: {
            type: 'object',
            properties: {
              location: { type: 'string' },
            },
            required: ['location'],
          },
        },
      },
    ],
    toolChoice: 'auto',
  });

  console.log('Response:', response);
}

// Example 5: List Models
async function listModels() {
  console.log('\nExample 5: List Models');

  const models = await client.models.list(10, 0);
  console.log('Available models:', models);

  // Get specific model details
  const gpt4 = await client.models.retrieve('gpt-4');
  console.log('GPT-4 Details:', {
    name: gpt4.name,
    provider: gpt4.provider,
    maxTokens: gpt4.maxTokens,
  });

  // Get model pricing
  const pricing = await client.models.getPricing('gpt-4');
  console.log('GPT-4 Pricing:', pricing);
}

// Example 6: Usage Tracking
async function usageTracking() {
  console.log('\nExample 6: Usage Tracking');

  // Get current usage
  const current = await client.usage.getCurrent();
  console.log('Current usage:', current);

  // Get usage history
  const history = await client.usage.list(
    '2024-01-01',
    '2024-01-31',
    100,
    0,
  );
  console.log('Usage history:', history);

  // Get usage by model
  const byModel = await client.usage.byModel('2024-01-01', '2024-01-31');
  console.log('Usage by model:', byModel);

  // Get costs
  const costs = await client.usage.getCosts('2024-01-01', '2024-01-31');
  console.log('Costs breakdown:', costs);
}

// Example 7: Credit Management
async function creditManagement() {
  console.log('\nExample 7: Credit Management');

  // Get credit balance
  const balance = await client.credits.balance();
  console.log('Credit balance:', {
    available: balance.available,
    total: balance.total,
    currency: balance.currency,
  });

  // Get credit history
  const history = await client.credits.history(50, 0);
  console.log('Credit history:', history);

  // Get payment methods
  const paymentMethods = await client.credits.getPaymentMethods();
  console.log('Payment methods:', paymentMethods);
}

// Example 8: Error Handling
async function errorHandling() {
  console.log('\nExample 8: Error Handling');

  try {
    // This will fail with invalid credentials
    await client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }],
    });
  } catch (error) {
    // Handle specific error types
    if (error instanceof AuthenticationError) {
      console.error('Authentication failed:', error.message);
    } else if (error instanceof ValidationError) {
      console.error('Validation errors:', error.validationErrors);
    } else if (error instanceof RateLimitError) {
      console.error('Rate limited:', error.message);
      console.error('Retry after:', error.retryAfter, 'seconds');
    } else if (error instanceof InsufficientCreditsError) {
      console.error('Insufficient credits:', error.message);
      console.error('Required:', error.required, 'Available:', error.available);
    } else if (error instanceof ProviderError) {
      console.error('Provider error:', error.message);
      console.error('Provider:', error.provider);
      console.error('Retryable:', error.retryable);
    } else if (error instanceof ApiError) {
      console.error('API error:', error.message);
      console.error('Status:', error.status);
      console.error('Code:', error.code);
      console.error('Details:', error.details);
    }
  }
}

// Example 9: Batch Processing with Retries
async function batchProcessing() {
  console.log('\nExample 9: Batch Processing');

  const messages = [
    'What is TypeScript?',
    'How does async/await work?',
    'Explain closures',
  ];

  const responses = await Promise.all(
    messages.map((msg) =>
      client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: msg }],
        maxTokens: 100,
      }),
    ),
  );

  responses.forEach((response, index) => {
    console.log(`Question ${index + 1}:`, messages[index]);
    console.log('Answer:', response.choices[0].message.content);
    console.log('---');
  });
}

// Example 10: Advanced Configuration
async function advancedConfiguration() {
  console.log('\nExample 10: Advanced Configuration');

  // Create client with custom base URL and timeouts
  const customClient = new ModelBridge({
    apiKey: process.env.MODELBRIDGE_API_KEY || 'sk-your-api-key',
    baseURL: 'https://custom.api.modelbridge.ai/v1',
    timeout: 60000, // 60 seconds
    maxRetries: 5,
    dangerouslyAllowBrowser: false,
  });

  console.log('Client configuration:', customClient.getConfig());

  // Make request with custom options
  const response = await customClient.chat.completions.create(
    {
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }],
    },
    {
      timeout: 30000, // Override timeout for this request
      headers: {
        'X-Custom-Header': 'value', // Add custom headers
      },
    },
  );

  console.log('Response:', response);

  // Close client when done
  customClient.close();
}

// Example 11: Token Counting
async function tokenCounting() {
  console.log('\nExample 11: Token Counting');

  const messages = [
    { role: 'user', content: 'What is the capital of France?' },
    { role: 'assistant', content: 'The capital of France is Paris.' },
  ];

  const tokenCount = await client.chat.completions.countTokens('gpt-4', messages);
  console.log('Token count:', tokenCount.tokenCount);
}

// Example 12: Abort Signal for Cancellation
async function abortSignal() {
  console.log('\nExample 12: Abort Signal for Cancellation');

  const controller = new AbortController();

  // Set a timeout to cancel after 5 seconds
  const timeoutId = setTimeout(() => {
    console.log('Cancelling request...');
    controller.abort();
  }, 5000);

  try {
    const response = await client.chat.completions.create(
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Write a long story' }],
        maxTokens: 1000,
      },
      { signal: controller.signal },
    );
    console.log('Response:', response);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Request was cancelled');
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

// Run examples
async function runExamples() {
  try {
    // Uncomment the examples you want to run
    await basicChatCompletion();
    // await streamingChatCompletion();
    // await streamingWithErrorHandling();
    // await chatWithTools();
    // await listModels();
    // await usageTracking();
    // await creditManagement();
    // await errorHandling();
    // await batchProcessing();
    // await advancedConfiguration();
    // await tokenCounting();
    // await abortSignal();

    console.log('\n✅ Examples completed successfully!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Export examples for testing
export {
  basicChatCompletion,
  streamingChatCompletion,
  streamingWithErrorHandling,
  chatWithTools,
  listModels,
  usageTracking,
  creditManagement,
  errorHandling,
  batchProcessing,
  advancedConfiguration,
  tokenCounting,
  abortSignal,
};

// Uncomment to run examples
// runExamples();
