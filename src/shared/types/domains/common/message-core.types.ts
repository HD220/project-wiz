// Central message types - consolidates all Message interfaces across the codebase
// Replaces 15+ scattered Message type definitions

export type MessageType =
  | "text"
  | "code"
  | "file"
  | "system"
  | "image"
  | "task_update"
  | "file_share";

export type SenderType = "user" | "agent" | "system";

export type ContextType = "direct" | "channel" | "group";

export interface MessageMetadata {
  reactions?: MessageReaction[];
  attachments?: FileAttachment[];
  mentions?: string[];
  replyTo?: string;
  isEdited?: boolean;
  editedAt?: Date;
  [key: string]: unknown;
}

export interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

// Base message interface - used by all domains
export interface BaseMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: SenderType;
  type: MessageType;
  timestamp: Date;
  createdAt: Date;
  updatedAt?: Date;
  metadata?: MessageMetadata;
}

// Channel-specific message
export interface ChannelMessage extends BaseMessage {
  channelId: string;
  contextType: "channel";
}

// Direct message (user conversations)
export interface DirectMessage extends BaseMessage {
  conversationId: string;
  contextType: "direct";
}

// Group message (future use)
export interface GroupMessage extends BaseMessage {
  groupId: string;
  contextType: "group";
}

// Union type for all message types
export type Message = ChannelMessage | DirectMessage | GroupMessage;

// DTOs for API communication
export interface CreateMessageDto {
  content: string;
  type: MessageType;
  contextType: ContextType;
  contextId: string; // channelId, conversationId, or groupId
  metadata?: Partial<MessageMetadata>;
}

export interface UpdateMessageDto {
  content?: string;
  metadata?: Partial<MessageMetadata>;
}

// UI-specific extensions
export interface FormattedMessage extends Message {
  isUser: boolean;
  isRead?: boolean;
}

// List/Pagination DTOs
export interface MessagePaginationDto<T extends Message = Message> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface MessageFilterDto {
  type?: MessageType;
  senderId?: string;
  senderType?: SenderType;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}
