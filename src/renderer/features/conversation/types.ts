// ===========================
// CONVERSATION FEATURE TYPES
// ===========================
// Updated to use new domain separation (DM vs Channel)

// Re-export domain types
export type {
  SelectDMConversation,
  DMConversationWithParticipants,
  DMConversationWithLastMessage,
  SelectDMParticipant,
} from "@/renderer/features/dm/dm-conversation.types";

export type {
  SelectProjectChannel,
  ProjectChannelWithLastMessage,
} from "@/renderer/features/project/project-channel.types";

export type {
  SelectMessage,
  MessageSourceType,
} from "@/renderer/features/message/message.types";

export type { AuthenticatedUser } from "@/main/features/auth/auth.types";

// ===========================
// UNIFIED CONVERSATION TYPES
// ===========================
// For components that need to handle both DM and Channel

export type ConversationType = "dm" | "channel";

// Unified conversation interface for renderer compatibility
export interface UnifiedConversation {
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
  // Optional fields
  projectId?: string | null;
  agentId?: string | null;
  title?: string | null;
  isArchived?: boolean;
  lastMessage?: {
    id: string;
    content: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  participants?: Array<{
    id: string;
    conversationId: string;
    userId: string;
    joinedAt: Date;
  }>;
  messages?: Array<{
    id: string;
    isActive: boolean;
    deactivatedAt: Date | null;
    deactivatedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    conversationId: string;
    content: string;
    authorId: string;
    senderId: string;
    senderType: "user" | "agent";
    metadata: unknown;
  }>;
}

// ===========================
// API INPUT TYPES
// ===========================

// Create DM input
export interface CreateDMInput {
  participantIds: string[];
  description?: string;
}

// Create Channel input
export interface CreateChannelInput {
  projectId: string;
  name: string;
  description?: string;
}

// Send message input (unified)
export interface SendMessageInput {
  sourceType: MessageSourceType;
  sourceId: string;
  content: string;
}

// ===========================
// UI STATE TYPES
// ===========================

// UI-only state
export interface ConversationUIState {
  selectedConversationId: string | null;
  selectedConversationType: ConversationType | null;
  showCreateDialog: boolean;
  showCreateChannelDialog: boolean;
  showArchived: boolean;
}

// Filters for conversation lists
export interface ConversationFilters {
  includeArchived?: boolean;
  includeInactive?: boolean;
}

// ===========================
// LEGACY COMPATIBILITY
// ===========================
// For gradual migration of existing components

export type ConversationWithParticipants = UnifiedConversation;
export type ConversationWithLastMessage = UnifiedConversation;
export type ConversationWithMessages = UnifiedConversation;
export type CreateConversationInput = CreateDMInput; // Default to DM for backward compatibility
