/**
 * Conversation entity for chat history.
 */
export interface Conversation {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

/**
 * Message entity for a conversation.
 */
export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  [key: string]: any;
}

/**
 * Supported export formats for history.
 */
export type ExportFormat = "json" | "csv";