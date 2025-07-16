import { eq, desc, and } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import {
  channelMessages,
  type ChannelMessageSchema,
} from "../../../persistence/schemas/channel-messages.schema";

const logger = getLogger("project-messages.operations");

export async function findMessagesByAuthor(
  authorId: string,
  channelId?: string,
): Promise<ChannelMessageSchema[]> {
  try {
    const db = getDatabase();
    const whereCondition = buildAuthorWhereCondition(authorId, channelId);

    const results = await db
      .select()
      .from(channelMessages)
      .where(whereCondition)
      .orderBy(desc(channelMessages.createdAt));

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

function buildAuthorWhereCondition(authorId: string, channelId?: string) {
  if (channelId) {
    return and(
      eq(channelMessages.authorId, authorId),
      eq(channelMessages.channelId, channelId),
    );
  }
  return eq(channelMessages.authorId, authorId);
}

export async function createProjectMessage(
  data: Partial<ChannelMessageSchema>,
): Promise<ChannelMessageSchema> {
  logger.warn("createProjectMessage not implemented yet.");
  return data as ChannelMessageSchema;
}

export async function findMessageById(
  id: string,
): Promise<ChannelMessageSchema | undefined> {
  logger.warn("findMessageById not implemented yet.");
  return undefined;
}

export async function findMessagesByChannel(
  channelId: string,
  limit?: number,
): Promise<ChannelMessageSchema[]> {
  logger.warn("findMessagesByChannel not implemented yet.");
  return [];
}

export async function deleteMessage(id: string, userId: string): Promise<void> {
  logger.warn("deleteMessage not implemented yet.");
}
