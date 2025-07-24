/**
 * Conversation types for renderer process
 */

export type ConversationType = "direct" | "channel" | "dm";

export interface SelectConversation {
  id: string;
  userId?: string;
  projectId?: string | null;
  agentId?: string | null;
  title?: string | null;
  name?: string | null;
  description?: string | null;
  type?: ConversationType;
  isArchived?: boolean;
  lastMessage?: Message;
  participants?: Array<{
    id: string;
    conversationId: string;
    userId: string;
    joinedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConversationInput {
  userId: string;
  projectId?: string;
  agentId: string;
  title: string;
  type?: ConversationType;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  authorId: string;
  senderType: "user" | "agent";
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithLastMessage extends SelectConversation {
  name: string | null;
  description?: string | null;
  agentId?: string | null;
  participants: Array<{
    id: string;
    conversationId: string;
    userId: string;
    joinedAt: Date;
  }>;
  lastMessage?: Message;
}
