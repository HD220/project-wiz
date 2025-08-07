import type {
  DMConversation,
  DMParticipant,
  Message,
  User,
} from "@/shared/types";

/**
 * Conversation-related types for renderer features
 */

// Re-export shared types for convenience
export type { DMConversation, DMParticipant, Message };

/**
 * Input type for creating a DM conversation
 */
export interface CreateConversationInput {
  participantIds: string[];
  description?: string;
}

/**
 * DM conversation with participants populated
 */
export interface DMConversationWithParticipants extends DMConversation {
  participants: DMParticipantWithUser[];
}

/**
 * DM participant with user data populated
 */
export interface DMParticipantWithUser extends DMParticipant {
  user: User;
}

/**
 * Authenticated user type - represents the current logged-in user
 */
export interface AuthenticatedUser {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  type: "human" | "agent";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message with select fields for database queries
 */
export interface SelectMessage extends Message {
  author?: User;
}

/**
 * Conversation list item for UI display
 */
export interface ConversationListItem {
  id: string;
  name: string | null;
  description: string | null;
  participantCount: number;
  lastMessage?: {
    content: string;
    createdAt: Date;
    authorName: string;
  };
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message creation input
 */
export interface CreateMessageInput {
  sourceType: "dm" | "channel";
  sourceId: string;
  content: string;
}

/**
 * Message update input
 */
export interface UpdateMessageInput {
  id: string;
  content: string;
}
