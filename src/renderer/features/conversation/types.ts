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

export type {
  AuthenticatedUser,
} from "@/main/features/auth/auth.types";

// Define ConversationType locally to avoid import issues
export type ConversationType = "dm" | "agent_chat";

// ===========================
// FRONTEND-SPECIFIC TYPES
// ===========================

// Conversation with participants (for list display)
export interface ConversationWithParticipants {
  id: string;
  name: string | null;
  description: string | null;
  type: ConversationType;
  agentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  participants: Array<{
    id: string;
    conversationId: string;
    participantId: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

// Conversation with last message (for sidebar with preview)
export interface ConversationWithLastMessage extends ConversationWithParticipants {
  lastMessage?: {
    id: string;
    conversationId: string;
    authorId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

// Conversation with full messages (for chat view)
export interface ConversationWithMessages extends ConversationWithParticipants {
  messages: Array<{
    id: string;
    conversationId: string;
    authorId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
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

// ===========================
// UI STATE TYPES
// ===========================

// UI-only state (for Zustand store)
export interface ConversationUIState {
  selectedConversationId: string | null;
  showCreateDialog: boolean;
}

// ===========================
// HOOK RETURN TYPES
// ===========================

// Conversations query result
export interface ConversationsQueryResult {
  conversations: ConversationWithLastMessage[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Messages query result
export interface MessagesQueryResult {
  conversation: ConversationWithMessages | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Send message mutation result
export interface SendMessageMutationResult {
  sendMessage: (input: SendMessageInput) => Promise<void>;
  isSending: boolean;
  error: Error | null;
}

// Create conversation mutation result
export interface CreateConversationMutationResult {
  createConversation: (participantIds: string[]) => Promise<string>;
  isCreating: boolean;
  error: Error | null;
}