import { ConversationEntity } from "../entities/conversation.entity";
import type { ConversationDto } from "../../../shared/types/message.types";
import type { ConversationData } from "../entities/conversation.schema";

export class ConversationMapper {
  toDto(entity: ConversationEntity): ConversationDto {
    const data = entity.toPlainObject();
    return {
      id: data.id,
      userId1: data.userId1,
      userId2: data.userId2,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  toDtoFromData(data: ConversationData): ConversationDto {
    return {
      id: data.id,
      userId1: data.userId1,
      userId2: data.userId2,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
