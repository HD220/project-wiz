// ===========================
// CONVERSATION FEATURE TYPES - SIMPLIFIED
// ===========================
// Re-export from simplified unified types

import type {
  ChatType,
  UniversalConversation,
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

// Re-export types
export type {
  ChatType as ConversationType,
  UniversalConversation,
  UniversalConversation as UnifiedConversation,
  RendererMessage,
  MessageGroup,
  ConversationFilters,
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
};

// ===========================
// API INPUT TYPES
// ===========================

export type CreateDMInput = CreateDMConversationInput;
export type CreateChannelInput = CreateProjectChannelInput;

// ===========================
// UI STATE TYPES
// ===========================

export interface ConversationUIState {
  selectedConversationId: string | null;
  selectedConversationType: ChatType;
  showCreateDialog: boolean;
  showCreateChannelDialog: boolean;
  showArchived: boolean;
}

// ===========================
// COMPONENT COMPATIBILITY TYPES
// ===========================

export type ConversationWithParticipants = DMConversationWithParticipants;
export type ConversationWithLastMessage = UniversalConversation;
export type CreateConversationInput = CreateDMConversationInput;
