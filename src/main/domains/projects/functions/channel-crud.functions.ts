import { getDatabase } from "../../infrastructure";
import { Channel } from "../entities/channel.entity";
import { channels } from "../../../persistence/schemas/channels.schema";
import { eq } from "drizzle-orm";
import type {
  CreateChannelDto,
  ChannelDto,
} from "../../../../shared/types/domains/projects/channel.types";

export function createChannel(data: CreateChannelDto): ChannelDto {
  const channel = Channel.create({
    name: data.name,
    projectId: data.projectId,
    description: data.description,
  });

  const db = getDatabase();
  db.insert(channels)
    .values({
      id: channel.getId(),
      name: channel.getName(),
      description: channel.getDescription(),
      projectId: channel.getProjectId(),
      createdAt: channel.getCreatedAt(),
      updatedAt: channel.getUpdatedAt(),
    })
    .run();

  return channel.toPlainObject();
}

export function findChannelById(id: string): ChannelDto | null {
  const db = getDatabase();
  const result = db.select().from(channels).where(eq(channels.id, id)).get();

  if (!result) return null;

  const channel = Channel.create({
    id: result.id,
    name: result.name,
    projectId: result.projectId,
    description: result.description,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  });

  return channel.toPlainObject();
}

export function findChannelsByProject(projectId: string): ChannelDto[] {
  const db = getDatabase();
  const results = db
    .select()
    .from(channels)
    .where(eq(channels.projectId, projectId))
    .all();

  return results.map((result) => {
    const channel = Channel.create({
      id: result.id,
      name: result.name,
      projectId: result.projectId,
      description: result.description,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
    return channel.toPlainObject();
  });
}

export function deleteChannel(id: string): void {
  const db = getDatabase();
  db.delete(channels).where(eq(channels.id, id)).run();
}
