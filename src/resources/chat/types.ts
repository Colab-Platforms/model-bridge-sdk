/**
 * Chat API types and interfaces
 */

/**
 * Chat message role
 */
export type ChatMessageRole = 'system' | 'user' | 'assistant' | 'function' | 'tool';

/**
 * Chat message
 */
export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
  name?: string;
  toolCallId?: string;
}

/**
 * Tool/function definition
 */
export interface Tool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
}

/**
 * Chat completion request
 */
export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string | string[];
  tools?: Tool[];
  toolChoice?: 'auto' | 'none' | 'required';
  responseFormat?: { type: 'text' | 'json_object' };
  user?: string;
}

/**
 * Tool call
 */
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * Usage statistics
 */
export interface Usage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Chat completion response
 */
export interface ChatCompletion {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finishReason: 'stop' | 'length' | 'function_call' | 'tool_calls' | null;
  }>;
  usage?: Usage;
}

/**
 * Chat completion chunk for streaming
 */
export interface ChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: Partial<ChatMessage> & { toolCalls?: ToolCall[] };
    finishReason: string | null;
  }>;
}

/**
 * List models request
 */
export interface ListModelsRequest {
  limit?: number;
  offset?: number;
}

/**
 * Create completion request
 */
export interface CreateCompletionRequest {
  model: string;
  prompt: string | string[];
  stream?: boolean;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string | string[];
}

/**
 * Completion response
 */
export interface Completion {
  id: string;
  object: 'text_completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    text: string;
    finishReason: 'stop' | 'length' | null;
  }>;
  usage?: Usage;
}

/**
 * Completion chunk for streaming
 */
export interface CompletionChunk {
  id: string;
  object: 'text_completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    text: string;
    finishReason: string | null;
  }>;
}
