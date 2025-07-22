import type {
  SelectConversation,
  InsertConversation,
  SelectConversationParticipant,
  InsertConversationParticipant,
  ConversationType,
} from "@/main/features/conversation/conversation.model";
import type {
  SelectMessage,
  InsertMessage,
  SelectLlmMessage,
  InsertLlmMessage,
} from "@/main/features/conversation/message.model";

// Conversation derived types
export type UpdateConversation = Partial<InsertConversation> & { id: string };
export type ConversationWithParticipants = SelectConversation & {
  participants: SelectConversationParticipant[];
};
export type ConversationWithMessages = SelectConversation & {
  messages: SelectMessage[];
};
export type ConversationWithMessagesAndParticipants = SelectConversation & {
  messages: SelectMessage[];
  participants: SelectConversationParticipant[];
};
export type ConversationWithLastMessage = SelectConversation & {
  participants: SelectConversationParticipant[];
  lastMessage?: SelectMessage;
};

// Conversation participant derived types
export type UpdateConversationParticipant =
  Partial<InsertConversationParticipant> & { id: string };

// Message derived types
export type UpdateMessage = Partial<InsertMessage> & { id: string };
export type MessageWithLlmData = SelectMessage & {
  llmMessage?: SelectLlmMessage;
};

// LLM message derived types
export type UpdateLlmMessage = Partial<InsertLlmMessage> & { id: string };

// Input types for API operations
export type CreateConversationInput = Omit<
  InsertConversation,
  "id" | "createdAt" | "updatedAt"
> & {
  participantIds: string[];
};
export type CreateMessageInput = Omit<
  InsertMessage,
  "id" | "createdAt" | "updatedAt"
>;
export type AddParticipantInput = Omit<
  InsertConversationParticipant,
  "id" | "createdAt" | "updatedAt"
>;

// Message service input types
export type SendMessageInput = Omit<
  InsertMessage,
  "id" | "createdAt" | "updatedAt"
>;

// Agent chat service input types
export interface SendAgentMessageInput {
  agentId: string;
  userId: string;
  content: string;
  useMemory?: boolean;
}

// Query filters
export type ConversationFilters = {
  type?: ConversationType;
  agentId?: string;
  participantId?: string;
  limit?: number;
  offset?: number;
};

export type MessageFilters = {
  conversationId?: string;
  authorId?: string;
  limit?: number;
  offset?: number;
};

// Re-export base types for convenience
export type {
  SelectConversation,
  InsertConversation,
  SelectConversationParticipant,
  InsertConversationParticipant,
  SelectMessage,
  InsertMessage,
  SelectLlmMessage,
  InsertLlmMessage,
  ConversationType,
};
