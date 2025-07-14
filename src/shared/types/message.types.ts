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
  metadata?: Record<string, any>;
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
  metadata?: Record<string, any>;
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

// Channels (for project channels)
export interface ChannelDto {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChannelDto {
  name: string;
  description?: string;
  projectId: string;
  isPrivate?: boolean;
  createdBy: string;
}

export interface ChannelFilterDto {
  projectId?: string;
  isPrivate?: boolean;
  createdBy?: string;
}
