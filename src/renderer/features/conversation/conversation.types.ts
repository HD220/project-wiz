// Re-export types from backend for consistency
export type {
  SelectConversation,
  InsertConversation,
  ConversationType,
  ConversationWithParticipants,
  ConversationWithMessages,
  ConversationWithMessagesAndParticipants,
  CreateConversationInput,
  SendMessageInput,
  MessageWithLlmData,
} from "@/main/features/conversation/conversation.types";

export type {
  AuthenticatedUser,
} from "@/main/features/user/user.types";