/**
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * import { ModelBridge } from '@model-bridge/sdk';
 *
 * // Initialize the client
 * const client = new ModelBridge({
 *   apiKey: process.env.MODELBRIDGE_API_KEY,
 * });
 *
 * // Use the SDK
 * const response = await client.chat.completions.create({
 *   model: 'gpt-4',
 *   messages: [
 *     { role: 'user', content: 'Hello!' }
 *   ],
 * });
 *
 * console.log(response.choices[0].message.content);
 * ```
 */

// Main client
export { ModelBridge } from './client';

// Core types and utilities
export * from './core';

// Resources (for direct type imports if needed)
export * from './resources';

// HTTP layer (for advanced usage)
export * from './http';

// Utilities (for advanced usage)
export * from './utils';
