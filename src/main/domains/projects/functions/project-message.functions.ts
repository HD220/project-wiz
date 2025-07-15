import { eq, desc, and } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import { channelMessages as MessageTable } from "../../../persistence/schemas/channel-messages.schema";
import { ProjectMessage } from "../entities";

const logger = getLogger("project-messages.functions");

export async function createProjectMessage(data: {
  content: string;
  channelId: string;
  authorId: string;
  authorName: string;
  type?: "text" | "code" | "file" | "system";
  metadata?: Record<string, any>;
}): Promise<any> {
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
      .insert(MessageTable)
      .values(message.toPlainObject())
      .returning();

    logger.info(`Project message created: ${message.getId()}`);

    return saved[0];
  } catch (error) {
    logger.error("Failed to create project message", { error, data });
    throw error;
  }
}

export async function findMessageById(id: string): Promise<any | null> {
  try {
    const db = getDatabase();
    const results = await db
      .select()
      .from(MessageTable)
      .where(eq(MessageTable.id, id));

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
): Promise<any[]> {
  try {
    const db = getDatabase();
    const results = await db
      .select()
      .from(MessageTable)
      .where(eq(MessageTable.channelId, channelId))
      .orderBy(desc(MessageTable.createdAt))
      .limit(limit);

    logger.info(`Found ${results.length} messages for channel: ${channelId}`);
    return results.reverse(); // Return in chronological order
  } catch (error) {
    logger.error("Failed to find messages by channel", { error, channelId });
    throw error;
  }
}

export async function findMessagesByAuthor(
  authorId: string,
  channelId?: string,
): Promise<any[]> {
  try {
    const db = getDatabase();

    let whereCondition;
    if (channelId) {
      whereCondition = and(
        eq(MessageTable.authorId, authorId),
        eq(MessageTable.channelId, channelId),
      );
    } else {
      whereCondition = eq(MessageTable.authorId, authorId);
    }

    const results = await db
      .select()
      .from(MessageTable)
      .where(whereCondition)
      .orderBy(desc(MessageTable.createdAt));

    logger.info(`Found ${results.length} messages by author: ${authorId}`);
    return results;
  } catch (error) {
    logger.error("Failed to find messages by author", {
      error,
      authorId,
      channelId,
    });
    throw error;
  }
}

export async function deleteMessage(id: string, userId: string): Promise<void> {
  try {
    const existing = await findMessageById(id);
    if (!existing) {
      throw new Error("Message not found");
    }

    const message = new ProjectMessage(existing);
    if (!message.canBeDeletedBy(userId)) {
      throw new Error("User cannot delete this message");
    }

    const db = getDatabase();
    await db.delete(MessageTable).where(eq(MessageTable.id, id));

    logger.info(`Message deleted: ${id} by user: ${userId}`);
  } catch (error) {
    logger.error("Failed to delete message", { error, id, userId });
    throw error;
  }
}
