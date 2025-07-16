import { eq } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import {
  channels,
  type ChannelSchema,
} from "../../../persistence/schemas/channels.schema";
import { Channel } from "../entities";

const logger = getLogger("channels.functions");

export async function createChannel(data: {
  name: string;
  projectId: string;
  createdBy: string;
  isPrivate?: boolean;
  description?: string | null;
}): Promise<ChannelSchema> {
  try {
    const channel = new Channel({
      name: data.name,
      projectId: data.projectId,
      createdBy: data.createdBy,
      isPrivate: data.isPrivate,
      description: data.description,
    });

    const db = getDatabase();
    const saved = await db
      .insert(channels)
      .values(channel.toPlainObject())
      .returning();

    logger.info(`Channel created: ${channel.getId()}`);
    return saved[0];
  } catch (error) {
    logger.error("Failed to create channel", { error, data });
    throw error;
  }
}

export async function findChannelById(
  id: string,
): Promise<ChannelSchema | null> {
  try {
    const db = getDatabase();
    const results = await db.select().from(channels).where(eq(channels.id, id));

    if (results.length === 0) {
      logger.warn(`Channel not found: ${id}`);
      return null;
    }

    return results[0];
  } catch (error) {
    logger.error("Failed to find channel by ID", { error, id });
    throw error;
  }
}

export async function findChannelsByProject(
  projectId: string,
): Promise<ChannelSchema[]> {
  try {
    const db = getDatabase();
    const results = await db
      .select()
      .from(channels)
      .where(eq(channels.projectId, projectId));

    logger.info(`Found ${results.length} channels for project: ${projectId}`);
    return results;
  } catch (error) {
    logger.error("Failed to find channels by project", { error, projectId });
    throw error;
  }
}

export async function deleteChannel(id: string): Promise<void> {
  try {
    const existing = await findChannelById(id);
    if (!existing) {
      throw new Error("Channel not found");
    }

    const db = getDatabase();
    await db.delete(channels).where(eq(channels.id, id));
    logger.info(`Channel deleted: ${id}`);
  } catch (error) {
    logger.error("Failed to delete channel", { error, id });
    throw error;
  }
}