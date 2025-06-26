// src_refactored/shared/ipc-chat.types.ts

import { LanguageModelMessage } from '../core/ports/adapters/llm-adapter.types';

export interface ChatSendMessagePayload {
  // agentId?: string; // Optional: if messages are directed to a specific agent personality
  messages: LanguageModelMessage[];
  // options?: Record<string, any>; // Optional: for LLM generation options, if not handled by agent config
}

// Define the structure for different types of stream events
export interface ChatStreamTokenPayload {
  type: 'token';
  data: string; // The actual token string
  // messageId?: string; // Optional: to associate token with a specific assistant message being built
  // partIndex?: number; // Optional: if the message is streamed in parts
}

export interface ChatStreamCompletePayload {
  type: 'complete';
  data: LanguageModelMessage; // The final assistant message, potentially with tool calls
  // messageId?: string; // Optional: to confirm completion of a specific message
}

export interface ChatStreamErrorPayload {
  type: 'error';
  error: {
    message: string;
    name?: string;
    // stack?: string; // Stack might be too verbose for IPC in many cases
  };
  // messageId?: string; // Optional: if the error is related to processing a specific message
}

export interface ChatStreamEndPayload {
    type: 'end'; // Indicates the end of the entire stream sequence for a given request
    // messageId?: string; // Optional
}


// Union type for all possible chat stream events
export type ChatStreamEventPayload =
  | ChatStreamTokenPayload
  | ChatStreamCompletePayload
  | ChatStreamErrorPayload
  | ChatStreamEndPayload;
