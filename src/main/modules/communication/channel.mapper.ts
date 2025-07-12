import { Channel } from "./domain/channel.entity";
import type { ChannelDto } from "../../../shared/types/channel.types";
import type { ChannelSchema } from "./persistence/schema";

export class ChannelMapper {
  
  // Schema → Entity
  toDomain(schema: ChannelSchema): Channel {
    return new Channel(
      schema.id,
      schema.name,
      schema.projectId,
      schema.type as any, // TypeScript cast - já validado no schema
      schema.createdBy,
      schema.isPrivate,
      schema.isArchived,
      schema.description || undefined,
      schema.createdAt,
      schema.updatedAt,
    );
  }

  // Entity → DTO (para o frontend)
  toDto(entity: Channel): ChannelDto {
    return {
      id: entity.id,
      name: entity.name,
      projectId: entity.projectId,
      type: entity.type,
      createdBy: entity.createdBy,
      isPrivate: entity.isPrivate,
      isArchived: entity.isArchived,
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  // Schema → DTO (direto, sem entity - mais eficiente para listagens)
  schemaToDtoFast(schema: ChannelSchema): ChannelDto {
    return {
      id: schema.id,
      name: schema.name,
      projectId: schema.projectId,
      type: schema.type,
      createdBy: schema.createdBy,
      isPrivate: schema.isPrivate,
      isArchived: schema.isArchived,
      description: schema.description || undefined,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    };
  }

  // Array de Schema → Array de DTO (otimizado)
  schemaToDtoArray(schemas: ChannelSchema[]): ChannelDto[] {
    return schemas.map(schema => this.schemaToDtoFast(schema));
  }

  // Array de Entity → Array de DTO
  entityToDtoArray(entities: Channel[]): ChannelDto[] {
    return entities.map(entity => this.toDto(entity));
  }
}