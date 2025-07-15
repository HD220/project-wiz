import { eq, and } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import { channels as ChannelTable } from "../../../persistence/schemas/channels.schema";
import { Channel } from "../entities";

const logger = getLogger("channels.functions");

export async function createChannel(data: {
  name: string;
  projectId: string;
  createdBy: string;
  isPrivate?: boolean;
  description?: string | null;
}): Promise<any> {
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
      .insert(ChannelTable)
      .values(channel.toPlainObject())
      .returning();

    logger.info(`Channel created: ${channel.getId()}`);

    return saved[0];
  } catch (error) {
    logger.error("Failed to create channel", { error, data });
    throw error;
  }
}

export async function findChannelById(id: string): Promise<any | null> {
  try {
    const db = getDatabase();
    const results = await db
      .select()
      .from(ChannelTable)
      .where(eq(ChannelTable.id, id));

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

export async function findChannelsByProject(projectId: string): Promise<any[]> {
  try {
    const db = getDatabase();
    const results = await db
      .select()
      .from(ChannelTable)
      .where(eq(ChannelTable.projectId, projectId));

    logger.info(`Found ${results.length} channels for project: ${projectId}`);
    return results;
  } catch (error) {
    logger.error("Failed to find channels by project", { error, projectId });
    throw error;
  }
}

export async function findAccessibleChannels(
  projectId: string,
  userId: string,
): Promise<any[]> {
  try {
    const allChannels = await findChannelsByProject(projectId);

    const accessibleChannels = allChannels.filter((channelData) => {
      const channel = new Channel(channelData);
      return channel.canBeAccessedBy(userId);
    });

    logger.info(
      `Found ${accessibleChannels.length} accessible channels for user: ${userId}`,
    );
    return accessibleChannels;
  } catch (error) {
    logger.error("Failed to find accessible channels", {
      error,
      projectId,
      userId,
    });
    throw error;
  }
}

export async function createGeneralChannel(
  projectId: string,
  createdBy: string,
): Promise<any> {
  try {
    const channel = Channel.createGeneral(projectId, createdBy);

    const db = getDatabase();
    const saved = await db
      .insert(ChannelTable)
      .values(channel.toPlainObject())
      .returning();

    logger.info(`General channel created for project: ${projectId}`);

    return saved[0];
  } catch (error) {
    logger.error("Failed to create general channel", {
      error,
      projectId,
      createdBy,
    });
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
    await db.delete(ChannelTable).where(eq(ChannelTable.id, id));

    logger.info(`Channel deleted: ${id}`);
  } catch (error) {
    logger.error("Failed to delete channel", { error, id });
    throw error;
  }
}
