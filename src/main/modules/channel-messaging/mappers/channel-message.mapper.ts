import { ChannelMessageEntity } from "../entities/channel-message.entity";
import type { ChannelMessageDto } from "../../../shared/types/channel-message.types";
import type { ChannelMessageData } from "../entities/channel-message.schema";

export class ChannelMessageMapper {
  toDto(entity: ChannelMessageEntity): ChannelMessageDto {
    const data = entity.toPlainObject();
    return {
      id: data.id,
      content: data.content,
      channelId: data.channelId,
      authorId: data.authorId,
      authorName: data.authorName,
      type: data.type,
      isEdited: data.isEdited,
      metadata: data.metadata,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  toDtoFromData(data: ChannelMessageData): ChannelMessageDto {
    return {
      id: data.id,
      content: data.content,
      channelId: data.channelId,
      authorId: data.authorId,
      authorName: data.authorName,
      type: data.type,
      isEdited: data.isEdited,
      metadata: data.metadata,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}