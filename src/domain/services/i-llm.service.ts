// src/domain/services/i-llm.service.ts

// Base for tool invocation by assistant
export interface ToolInvocation {
  toolCallId: string; // Unique ID for this specific tool call instance
  toolName: string;   // The name of the tool to be called
  args: any;          // Arguments for the tool, ideally a structured object
}

// System Message
export interface SystemMessage {
  role: 'system';
  content: string;
}

// User Message
export interface UserMessage {
  role: 'user';
  content: string;
  // Vercel AI SDK also allows `experimental_attachments` here
}

// Assistant Message
export interface AssistantMessage {
  role: 'assistant';
  content: string | null; // Can be null if making tool calls
  toolInvocations?: ToolInvocation[]; // Replaces old toolCalls, aligns with Vercel AI SDK
  // Vercel AI SDK also has `ui` for assistant-provided UI elements
}

// Tool Message (response from a tool execution)
export interface ToolMessage {
  role: 'tool';
  toolCallId: string; // The ID of the tool call this is a result for
  toolName?: string;   // The name of the tool that was called (optional, but good for context)
  content: string;    // The result of the tool execution, often stringified JSON
}

export type ChatMessage = SystemMessage | UserMessage | AssistantMessage | ToolMessage;

export interface LLMToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: object; // JSON schema object
  };
}

export interface LLMStreamRequest {
  modelId: string; // Now expected to be a provider-prefixed ID, e.g., "openai/gpt-4-turbo" or a registered custom model ID
  systemPrompt?: string;
  messages: ChatMessage[];
  tools?: LLMToolDefinition[];
  temperature?: number;
  maxTokens?: number;
  // other params...
}

export type RevisedLLMStreamEvent =
  | { type: 'text-delta'; textDelta: string }
  | { type: 'tool-call'; toolInvocation: ToolInvocation }
  | { type: 'llm-error'; error: string }
  | { type: 'stream-end'; finishReason?: string };


export interface ILLMService {
  streamText(params: LLMStreamRequest): Promise<AsyncIterable<RevisedLLMStreamEvent>>;
}
