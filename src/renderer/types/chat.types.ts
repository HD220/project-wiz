// ===========================
// UNIFIED CHAT TYPES - SIMPLIFIED
// ===========================
// Tipos diretos e simples para o frontend, sem re-exports desnecessários

// Re-export shared types
export type {
  SelectMessage,
  MessageSourceType,
  SendMessageInput,
} from "@/shared/types";

export type {
  SelectDMConversation,
  DMConversationWithParticipants,
  DMConversationWithLastMessage,
  CreateDMConversationInput,
} from "@/shared/types";

export type {
  SelectProjectChannel,
  ProjectChannelWithLastMessage,
  CreateProjectChannelInput,
} from "@/shared/types";

export type { AuthenticatedUser } from "@/shared/types";

// Note: Using import() syntax to avoid circular dependencies
export interface UniversalChatProps {
  chatType: ChatType;
  sourceId: string; // dmId ou channelId
  messages: RendererMessage[];
  currentUser: import("@/shared/types").AuthenticatedUser;
  availableUsers: unknown[];
  isArchived?: boolean;
  archivedAt?: Date | null;
  className?: string;
}

// ===========================
// UNIVERSAL CHAT INTERFACE
// ===========================
// Interface universal para componentes que trabalham com ambos (DM/Channel)

export type ChatType = "dm" | "channel";

// ===========================
// SIMPLIFIED MESSAGE TYPES
// ===========================
// Tipos simplificados para compatibilidade com UI existente

export interface RendererMessage {
  id: string;
  isActive: boolean;
  deactivatedAt: Date | null;
  deactivatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  conversationId: string; // Compatibility field - mapped to sourceId
  content: string;
  authorId: string;
  senderId: string;
  senderType: "user" | "agent";
  metadata: unknown;
}

// ===========================
// CONVERSATION COMPATIBILITY
// ===========================
// Tipos de compatibilidade para componentes existentes

export interface UniversalConversation {
  id: string;
  name: string | null;
  description: string | null;
  type: ChatType;
  isActive: boolean;
  deactivatedAt: Date | null;
  deactivatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  archivedBy: string | null;
  isArchived?: boolean;
  // Optional fields para compatibilidade
  projectId?: string | null;
  agentId?: string | null;
  title?: string | null;
  lastMessage?: RendererMessage;
  participants?: Array<{
    id: string;
    conversationId: string;
    userId: string;
    joinedAt: Date;
  }>;
  messages?: RendererMessage[];
}

// ===========================
// LEGACY COMPATIBILITY
// ===========================
// Aliases para compatibilidade com código existente

export type ConversationWithParticipants = UniversalConversation;
export type ConversationWithLastMessage = UniversalConversation;
export type ConversationWithMessages = UniversalConversation;
export type SelectConversation = UniversalConversation;

// ===========================
// HELPER FUNCTIONS TYPES
// ===========================

export interface MessageGroup {
  authorId: string;
  messages: RendererMessage[];
}

export interface ConversationFilters {
  includeArchived?: boolean;
  includeInactive?: boolean;
}
