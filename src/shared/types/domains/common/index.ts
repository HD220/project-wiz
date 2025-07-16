// Central export for common domain types
// Provides unified access to message types across all domains

export * from "./message-core.types";

// Re-export frequently used types for convenience
export type {
  Message,
  BaseMessage,
  ChannelMessage,
  DirectMessage,
  FormattedMessage,
  CreateMessageDto,
  UpdateMessageDto,
  MessagePaginationDto,
  MessageFilterDto,
  MessageType,
  SenderType,
  ContextType,
  MessageMetadata,
  MessageReaction,
  FileAttachment,
} from "./message-core.types";
