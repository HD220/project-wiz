export interface ChannelMessage {
  id: string;
  content: string;
  channelId: string;
  authorId: string;
  authorName: string;
  type: string;
  metadata?: ChannelMessageMetadata;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChannelMessagePaginationDto {
  data: ChannelMessage[];
  total: number;
  limit: number;
  offset: number;
}

export interface ChannelMessageFilterDto {}
