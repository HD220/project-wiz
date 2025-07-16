export interface ChannelMessage {
  id: string;
  channelId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ChannelMessageDto = ChannelMessage;

export interface ChannelMessagePaginationDto {
  data: ChannelMessage[];
  total: number;
  limit: number;
  offset: number;
}
