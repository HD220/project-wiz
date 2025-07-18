// Central export for all shared types - simplified structure
export * from "./message-core.types";
export * from "./project-core.types";
export * from "./agent-core.types";
export * from "./llm-provider-core.types";
export * from "./user-core.types";

// Legacy exports for backwards compatibility
export * from "./common";
export * from "./auth.types";
export * from "./calendar.types";
export * from "./electron.types";
export * from "./page-info.types";
export * from "./settings.types";

// Re-export channel types to avoid conflicts
export {
  ChannelDto,
  CreateChannelDto,
  UpdateChannelDto,
  ChannelFilterDto,
} from "./domains/projects/channel.types";

// Re-export channel message types to avoid conflicts
export {
  CreateChannelMessageDto,
  UpdateChannelMessageDto,
  ChannelMessageDto,
  ChannelMessageFilterDto,
  ChannelMessageType,
  type ChannelMessageTypeEnum,
  ChannelMessagePaginationDto,
  AISendMessageRequestDto,
  AISendMessageResponseDto,
  AIRegenerateMessageRequestDto,
  AIChatConfigDto,
} from "./domains/projects/channel-message.types";
