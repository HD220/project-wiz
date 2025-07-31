import type {
  SelectMessage,
  InsertMessage,
  SelectLlmMessage,
  InsertLlmMessage,
  MessageSourceType,
} from "./message.model";

// Message derived types
export type UpdateMessage = Partial<InsertMessage> & { id: string };
export type MessageWithLlmData = SelectMessage & {
  llmMessage?: SelectLlmMessage;
};

// Input types for API operations
export type SendMessageInput = {
  sourceType: MessageSourceType;
  sourceId: string;
  authorId: string;
  content: string;
};

export type SendLlmMessageInput = {
  messageInput: SendMessageInput;
  llmData: Omit<
    InsertLlmMessage,
    "id" | "messageId" | "createdAt" | "updatedAt"
  >;
};

// Query filters
export type MessageFilters = {
  sourceType?: MessageSourceType;
  sourceId?: string;
  authorId?: string;
  includeInactive?: boolean;
  limit?: number;
  offset?: number;
};

// Re-export base types for convenience
export type {
  SelectMessage,
  InsertMessage,
  SelectLlmMessage,
  InsertLlmMessage,
  MessageSourceType,
};
