// ===========================
// CONVERSATION FEATURE TYPES
// ===========================
// Centralized, clean types following CLAUDE.md principles

// Re-export base types from backend
export type {
  SelectConversation,
  InsertConversation,
  SelectConversationParticipant,
} from "@/main/features/conversation/conversation.model";

export type {
  SelectMessage,
  InsertMessage,
} from "@/main/features/conversation/message.model";

export type { AuthenticatedUser } from "@/main/features/auth/auth.types";

// Define ConversationType locally to avoid import issues
export type ConversationType = "dm" | "channel";

// ===========================
// FRONTEND-SPECIFIC TYPES
// ===========================

// Conversation with participants (for list display)
export interface ConversationWithParticipants {
  type: ConversationType;
  name: string | null;
  id: string;
  isActive: boolean;
  deactivatedAt: Date | null;
  deactivatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  archivedAt: Date | null;
  archivedBy: string | null;
  agentId?: string | null;
  participants: Array<{
    id: string;
    conversationId: string;
    participantId: string;
    isActive: boolean;
    deactivatedAt: Date | null;
    deactivatedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

// Conversation with last message (for sidebar with preview)
export interface ConversationWithLastMessage
  extends ConversationWithParticipants {
  lastMessage?: {
    id: string;
    isActive: boolean;
    deactivatedAt: Date | null;
    deactivatedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    conversationId: string;
    content: string;
    authorId: string;
  };
}

// Conversation with full messages (for chat view)
export interface ConversationWithMessages extends ConversationWithParticipants {
  messages: Array<{
    id: string;
    isActive: boolean;
    deactivatedAt: Date | null;
    deactivatedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    conversationId: string;
    content: string;
    authorId: string;
  }>;
}

// ===========================
// API INPUT TYPES
// ===========================

// Create conversation input
export interface CreateConversationInput {
  name?: string | null;
  description?: string | null;
  type: ConversationType;
  agentId?: string | null;
  participantIds: string[];
}

// Send message input
export interface SendMessageInput {
  conversationId: string;
  authorId: string;
  content: string;
}

// Archive conversation input (without reason - removed per user request)
export interface ArchiveConversationInput {
  conversationId: string;
}

// ===========================
// UI STATE TYPES
// ===========================

// UI-only state (for Zustand store)
export interface ConversationUIState {
  selectedConversationId: string | null;
  showCreateDialog: boolean;
  showArchived: boolean; // New field for archive toggle
}

// Filters for conversation list
export interface ConversationFilters {
  includeArchived?: boolean;
  includeInactive?: boolean;
}
