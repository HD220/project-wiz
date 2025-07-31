import type {
  SelectDMConversation,
  InsertDMConversation,
  SelectDMParticipant,
  InsertDMParticipant,
} from "./dm-conversation.model";

// DM Conversation derived types
export type UpdateDMConversation = Partial<InsertDMConversation> & {
  id: string;
};
export type DMConversationWithParticipants = SelectDMConversation & {
  participants: SelectDMParticipant[];
};

// Input types for API operations
export type CreateDMConversationInput = {
  participantIds: string[];
  currentUserId?: string; // For title generation (exclude from title)
  description?: string;
};

export type DMConversationWithLastMessage = SelectDMConversation & {
  participants: SelectDMParticipant[];
  lastMessage?: {
    id: string;
    content: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

// Query filters
export type DMConversationFilters = {
  includeInactive?: boolean;
  includeArchived?: boolean;
  limit?: number;
  offset?: number;
};

// Re-export base types for convenience
export type {
  SelectDMConversation,
  InsertDMConversation,
  SelectDMParticipant,
  InsertDMParticipant,
};
