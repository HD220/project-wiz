// src_refactored/core/ports/adapters/llm-adapter.types.ts

export interface LLMGenerationOptions {
  modelId?: string; // Specific model ID if overriding a default
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  // TODO: Add 'tools' and 'tool_choice' options if the underlying SDKs support them directly in options
  // For now, tool definitions will be passed as part of the LanguageModelMessage sequence or handled by the adapter.
}

export interface LanguageModelMessageToolCall {
  id: string;
  type: 'function'; // Currently, only 'function' is common
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface LanguageModelMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null; // Content can be null, e.g., for assistant messages with only tool_calls
  tool_calls?: LanguageModelMessageToolCall[]; // For assistant role (response from LLM)
  tool_call_id?: string; // For tool role (request to LLM with tool result)
  // name?: string; // Optional: For 'tool' role, the name of the tool whose result is being provided.
                 // Or for 'function' role (if functions are directly used instead of tools).
                 // Vercel AI SDK examples show 'name' on 'tool' role messages for results.
}
