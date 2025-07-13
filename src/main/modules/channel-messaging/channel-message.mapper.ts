import { ChannelMessage } from "./domain/channel-message.entity";
import type { ChannelMessageDto } from "../../../shared/types/channel-message.types";
import type { ChannelMessageSchema } from "../../persistence/schemas/channel-messages.schema";

export class ChannelMessageMapper {
  
  // Schema → Entity
  toDomain(schema: ChannelMessageSchema): ChannelMessage {
    return new ChannelMessage(
      schema.id,
      schema.content,
      schema.channelId,
      schema.authorId,
      schema.authorName,
      schema.type as any, // TypeScript cast - já validado no schema
      schema.isEdited,
      schema.metadata ? JSON.parse(schema.metadata) : undefined,
      schema.createdAt,
      schema.updatedAt,
    );
  }

  // Entity → DTO (para o frontend)
  toDto(entity: ChannelMessage): ChannelMessageDto {
    return {
      id: entity.id,
      content: entity.content,
      channelId: entity.channelId,
      authorId: entity.authorId,
      authorName: entity.authorName,
      type: entity.type,
      isEdited: entity.isEdited,
      metadata: entity.metadata,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  // Schema → DTO (direto, sem entity - mais eficiente para listagens)
  schemaToDtoFast(schema: ChannelMessageSchema): ChannelMessageDto {
    return {
      id: schema.id,
      content: schema.content,
      channelId: schema.channelId,
      authorId: schema.authorId,
      authorName: schema.authorName,
      type: schema.type,
      isEdited: schema.isEdited,
      metadata: schema.metadata ? JSON.parse(schema.metadata) : undefined,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    };
  }

  // Array de Schema → Array de DTO (otimizado)
  schemaToDtoArray(schemas: ChannelMessageSchema[]): ChannelMessageDto[] {
    return schemas.map(schema => this.schemaToDtoFast(schema));
  }

  // Array de Entity → Array de DTO
  entityToDtoArray(entities: ChannelMessage[]): ChannelMessageDto[] {
    return entities.map(entity => this.toDto(entity));
  }
}