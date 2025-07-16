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