// Central export for all shared types organized by domains
export * from "./domains/agents/agent.types";
export * from "./domains/llm/llm-provider.types";
export * from "./domains/users/message.types";
export * from "./domains/projects/project.types";
export * from "./domains/users/user.types";

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
