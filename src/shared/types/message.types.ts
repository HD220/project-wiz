export interface MessageDto {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "agent";
  conversationId: string;
  timestamp: Date;
}

export interface ConversationDto {
  id: string;
  participants: string[]; // User/Agent IDs
  lastMessageAt?: Date;
  createdAt: Date;
}

export interface CreateMessageDto {
  content: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "agent";
  conversationId: string;
}

export interface CreateConversationDto {
  participants: string[];
}

export interface MessageFilterDto {
  conversationId?: string;
  senderId?: string;
  limit?: number;
  offset?: number;
}

export interface ConversationFilterDto {
  participantId?: string;
}