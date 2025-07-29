// ===========================
// CONVERSATION FEATURE TYPES - SIMPLIFIED
// ===========================
// Re-export from simplified unified types

export type {
  ChatType as ConversationType,
  UniversalConversation,
  UniversalConversation as UnifiedConversation,
  RendererMessage,
  MessageGroup,
  ConversationFilters,
  // Domain-specific types
  SelectMessage,
  MessageSourceType,
  SendMessageInput,
  SelectDMConversation,
  DMConversationWithParticipants,
  DMConversationWithLastMessage,
  CreateDMConversationInput,
  SelectProjectChannel,
  ProjectChannelWithLastMessage,
  CreateProjectChannelInput,
  AuthenticatedUser,
} from "@/renderer/types/chat.types";

// ===========================
// API INPUT ALIASES
// ===========================

export type CreateDMInput = any; // Simplified for compatibility
export type CreateChannelInput = any; // Simplified for compatibility

// ===========================
// UI STATE TYPES
// ===========================

export interface ConversationUIState {
  selectedConversationId: string | null;
  selectedConversationType: any; // Simplified for compatibility
  showCreateDialog: boolean;
  showCreateChannelDialog: boolean;
  showArchived: boolean;
}

// ===========================
// LEGACY COMPATIBILITY
// ===========================

export type ConversationWithParticipants = any; // Simplified for compatibility
export type ConversationWithLastMessage = any; // Simplified for compatibility
export type ConversationWithMessages = any; // Simplified for compatibility
export type SelectConversation = any; // Simplified for compatibility
export type CreateConversationInput = CreateDMInput; // Default to DM for backward compatibility
