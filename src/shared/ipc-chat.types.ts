import { LanguageModelMessage } from "../core/ports/adapters/llm-adapter.types";

export interface ChatSendMessagePayload {
  messages: LanguageModelMessage[];
}

// Define the structure for different types of stream events
export interface ChatStreamTokenPayload {
  type: "token";
  data: string;
  // messageId?: string; // Optional: to associate token with a specific assistant message being built
  // partIndex?: number; // Optional: if the message is streamed in parts
}

export interface ChatStreamCompletePayload {
  type: "complete";
  data: LanguageModelMessage;
  // messageId?: string; // Optional: to confirm completion of a specific message
}

export interface ChatStreamErrorPayload {
  type: "error";
  error: {
    message: string;
    name?: string;
    // stack?: string; // Stack might be too verbose for IPC in many cases
  };
  // messageId?: string; // Optional: if the error is related to processing a specific message
}

export interface ChatStreamEndPayload {
  type: "end";
  // messageId?: string; // Optional
}

// Union type for all possible chat stream events
export type ChatStreamEventPayload =
  | ChatStreamTokenPayload
  | ChatStreamCompletePayload
  | ChatStreamErrorPayload
  | ChatStreamEndPayload;

export interface ChatWindowConversationHeader {
  id: string;
  name: string;
  type: "dm" | "channel" | "agent";
  avatarUrl?: string;
}
