export type ChannelMessageMetadata = Record<
  string,
  string | number | boolean | null
>;

export const ChannelMessageType = {
  TEXT: "text",
  CODE: "code",
  FILE: "file",
  SYSTEM: "system",
} as const;

export type ChannelMessageTypeEnum =
  (typeof ChannelMessageType)[keyof typeof ChannelMessageType];

export interface ChannelMessageDto {
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
  messages: ChannelMessageDto[];
  totalCount: number;
  hasMore: boolean;
  nextOffset?: number;
}
