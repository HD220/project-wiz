import { ChannelMessageMetadata } from "./base.types";

export interface CreateChannelMessageDto {
  content: string;
  channelId: string;
  authorId: string;
  authorName: string;
  type?: "text" | "code" | "file" | "system";
  metadata?: ChannelMessageMetadata;
}

export interface UpdateChannelMessageDto {
  id: string;
  content?: string;
  metadata?: ChannelMessageMetadata;
}

export interface ChannelMessageFilterDto {
  channelId?: string;
  authorId?: string;
  type?: string;
  limit?: number;
  offset?: number;
  searchContent?: string;
}
