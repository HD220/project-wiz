// src/domain/services/i-llm.service.ts

// Based on common patterns, e.g., Vercel AI SDK or OpenAI's structure
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null; // Content is null if tool_calls are present for assistant
  toolCalls?: { // For assistant messages requesting tool use
    id: string; // Tool call ID
    type: 'function'; // Currently, only 'function' is supported by many models
    function: {
      name: string;
      arguments: string; // JSON string of arguments
    };
  }[];
  toolCallId?: string; // For tool messages, the ID of the tool call being responded to
  name?: string; // For tool messages, the name of the tool that was called
}

export interface LLMToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: object; // JSON schema object for parameters
  };
}

export interface LLMStreamRequest {
  modelId: string;
  systemPrompt?: string; // Optional, can be part of messages array
  messages: ChatMessage[];
  tools?: LLMToolDefinition[];
  temperature?: number;
  maxTokens?: number;
  // Add other common parameters like topP, presencePenalty, frequencyPenalty etc.
}

// Represents parts of a streamed response
export type LLMStreamEvent =
  | { type: 'text-delta'; textDelta: string }
  | { type: 'tool-call-delta'; toolCallId: string, toolName?: string, argsChunk?: string } // For streaming tool call arguments
  | { type: 'tool-call'; toolCallId: string, toolName: string, args: string } // Complete tool call
  | { type: 'llm-error'; error: string }
  | { type: 'stream-end'; finishReason?: string }; // e.g. 'stop', 'length', 'tool_calls'

export interface ILLMService {
  /**
   * Streams text and tool calls from an LLM based on the provided messages and configuration.
   *
   * @param params The parameters for the LLM request.
   * @returns An AsyncIterable that yields LLMStreamEvents as they are received.
   */
  streamText(params: LLMStreamRequest): Promise<AsyncIterable<LLMStreamEvent>>;

  // TODO: Consider adding a non-streaming variant if needed for simpler use cases,
  // e.g., generateText(params: LLMTextRequest): Promise<LLMTextResponse>;
  // For now, focusing on streaming as it's more versatile for agent interactions.
}
