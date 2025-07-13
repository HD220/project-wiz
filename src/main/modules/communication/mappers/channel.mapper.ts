import { ChannelEntity } from "../entities/channel.entity";
import type { ChannelDto } from "../../../shared/types/channel.types";
import type { ChannelData } from "../entities/channel.schema";

export class ChannelMapper {
  toDto(entity: ChannelEntity): ChannelDto {
    const data = entity.toPlainObject();
    return {
      id: data.id,
      name: data.name,
      projectId: data.projectId,
      type: data.type,
      createdBy: data.createdBy,
      isPrivate: data.isPrivate,
      isArchived: data.isArchived,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  toDtoFromData(data: ChannelData): ChannelDto {
    return {
      id: data.id,
      name: data.name,
      projectId: data.projectId,
      type: data.type,
      createdBy: data.createdBy,
      isPrivate: data.isPrivate,
      isArchived: data.isArchived,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}