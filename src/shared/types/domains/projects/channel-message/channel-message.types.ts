// Use centralized message types instead of duplicating
import type {
  ChannelMessage as BaseChannelMessage,
  MessagePaginationDto,
  MessageFilterDto,
} from "@/shared/types/domains/common";

// Re-export centralized types for this domain
export type ChannelMessage = BaseChannelMessage;

export type ChannelMessagePaginationDto = MessagePaginationDto<ChannelMessage>;

export type ChannelMessageFilterDto = MessageFilterDto;
