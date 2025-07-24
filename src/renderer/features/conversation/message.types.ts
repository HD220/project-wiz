/**
 * Message types for renderer process
 */

export interface SendMessageInput {
  conversationId: string;
  authorId: string;
  content: string;
}

export interface Message {
  id: string;
  conversationId: string;
  authorId: string;
  senderId: string;
  senderType: "user" | "agent";
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
