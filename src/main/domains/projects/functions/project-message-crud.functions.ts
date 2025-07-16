import { eq, desc } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import {
  channelMessages,
  type ChannelMessageSchema,
} from "../../../persistence/schemas/channel-messages.schema";
import { ProjectMessage } from "../entities";

const logger = getLogger("project-messages.functions");

export async function createProjectMessage(data: {
  content: string;
  channelId: string;
  authorId: string;
  authorName: string;
  type?: "text" | "code" | "file" | "system";
  metadata?: Record<string, unknown>;
}): Promise<ChannelMessageSchema> {
  try {
    const message = new ProjectMessage({
      content: data.content,
      channelId: data.channelId,
      authorId: data.authorId,
      authorName: data.authorName,
      type: data.type,
      metadata: data.metadata,
    });

    const db = getDatabase();
    const saved = await db
      .insert(channelMessages)
      .values(message.toPlainObject())
      .returning();

    logger.info(`Project message created: ${message.getId()}`);
    return saved[0];
  } catch (error) {
    logger.error("Failed to create project message", { error, data });
    throw error;
  }
}

export async function findMessageById(
  id: string,
): Promise<ChannelMessageSchema | null> {
  try {
    const db = getDatabase();
    const results = await db
      .select()
      .from(channelMessages)
      .where(eq(channelMessages.id, id));

    if (results.length === 0) {
      logger.warn(`Message not found: ${id}`);
      return null;
    }

    return results[0];
  } catch (error) {
    logger.error("Failed to find message by ID", { error, id });
    throw error;
  }
}

export async function findMessagesByChannel(
  channelId: string,
  limit: number = 50,
): Promise<ChannelMessageSchema[]> {
  try {
    const db = getDatabase();
    const results = await db
      .select()
      .from(channelMessages)
      .where(eq(channelMessages.channelId, channelId))
      .orderBy(desc(channelMessages.createdAt))
      .limit(limit);

    logger.info(`Found ${results.length} messages for channel: ${channelId}`);
    return results.reverse();
  } catch (error) {
    logger.error("Failed to find messages by channel", { error, channelId });
    throw error;
  }
}

export async function deleteMessage(id: string, userId: string): Promise<void> {
  try {
    const existing = await findMessageById(id);
    if (!existing) {
      throw new Error("Message not found");
    }

    validateMessageDeletion(existing, userId);

    const db = getDatabase();
    await db.delete(channelMessages).where(eq(channelMessages.id, id));
    logger.info(`Message deleted: ${id} by user: ${userId}`);
  } catch (error) {
    logger.error("Failed to delete message", { error, id, userId });
    throw error;
  }
}

function validateMessageDeletion(existing: ChannelMessageSchema, userId: string) {
  const message = new ProjectMessage({
    ...existing,
    metadata: existing.metadata ? JSON.parse(existing.metadata) : undefined,
  });
  
  if (!message.canBeDeletedBy(userId)) {
    throw new Error("User cannot delete this message");
  }
}