export type MessageMetadata = Record<string, string | number | boolean | null>;

export interface MessageDto {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "agent" | "system";
  conversationId: string;
  createdAt: Date;
  // Optional fields for compatibility
  contextType?: "direct" | "channel" | "group";
  contextId?: string;
  type?: "text" | "code" | "file" | "system";
  metadata?: MessageMetadata;
  isEdited?: boolean;
  updatedAt?: Date;
  timestamp?: Date;
}

export interface CreateMessageDto {
  content: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "agent" | "system";
  conversationId: string;
  // Optional fields
  contextType?: "direct" | "channel" | "group";
  contextId?: string;
  type?: "text" | "code" | "file" | "system";
  metadata?: MessageMetadata;
}

export interface MessageFilterDto {
  contextId?: string;
  contextType?: "direct" | "channel" | "group";
  senderId?: string;
  senderType?: "user" | "agent" | "system";
  type?: "text" | "code" | "file" | "system";
}

// Conversations (for direct messages and groups)
export interface ConversationDto {
  id: string;
  type: "direct" | "group";
  participants: string[]; // User/Agent IDs
  lastMessageAt?: Date;
  createdAt: Date;
}

export interface CreateConversationDto {
  type?: "direct" | "group";
  participants: string[];
}

export interface ConversationFilterDto {
  type?: "direct" | "group";
  participantId?: string;
}

// Note: Channel types are now in domains/projects/channel.types.ts
