import { MessageEntity } from "../entities/message.entity";
import type { MessageDto } from "../../../shared/types/message.types";
import type { MessageData } from "../entities/message.schema";

export class MessageMapper {
  toDto(entity: MessageEntity): MessageDto {
    const data = entity.toPlainObject();
    return {
      id: data.id,
      content: data.content,
      conversationId: data.conversationId,
      senderId: data.senderId,
      receiverId: data.receiverId,
      type: data.type,
      isEdited: data.isEdited,
      isRead: data.isRead,
      metadata: data.metadata,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  toDtoFromData(data: MessageData): MessageDto {
    return {
      id: data.id,
      content: data.content,
      conversationId: data.conversationId,
      senderId: data.senderId,
      receiverId: data.receiverId,
      type: data.type,
      isEdited: data.isEdited,
      isRead: data.isRead,
      metadata: data.metadata,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
