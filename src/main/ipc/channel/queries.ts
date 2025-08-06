import { eq, and, desc, sql, isNull, inArray, asc } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/config/database";
import { 
  projectChannelsTable,
  type SelectProjectChannel,
  type InsertProjectChannel
} from "@/main/schemas/project-channel.schema";
import { messagesTable, type SelectMessage, type InsertMessage } from "@/main/schemas/message.schema";
import { projectsTable } from "@/main/schemas/project.schema";
import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";

const { getDatabase } = createDatabaseConnection(true);
const logger = getLogger("channel.queries");

/**
 * Find project channel by ID with ownership validation
 */
export async function findProjectChannel(id: string, ownerId: string): Promise<SelectProjectChannel | null> {
  const db = getDatabase();
  
  const [channel] = await db
    .select()
    .from(projectChannelsTable)
    .where(
      and(
        eq(projectChannelsTable.id, id),
        eq(projectChannelsTable.ownerId, ownerId)
      )
    )
    .limit(1);

  return channel || null;
}

/**
 * Find project channel by ID without ownership validation (for system operations)
 */
export async function findProjectChannelById(id: string): Promise<SelectProjectChannel | null> {
  const db = getDatabase();
  
  const [channel] = await db
    .select()
    .from(projectChannelsTable)
    .where(eq(projectChannelsTable.id, id))
    .limit(1);

  return channel || null;
}

/**
 * Create new project channel with project validation
 */
export async function createProjectChannel(data: InsertProjectChannel): Promise<SelectProjectChannel> {
  const db = getDatabase();

  // Use synchronous transaction pattern for better-sqlite3
  const result = db.transaction((tx) => {
    // 1. Verify project exists and is active (and owned by the same user)
    const projectResults = tx
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, data.projectId),
          eq(projectsTable.ownerId, data.ownerId),
          eq(projectsTable.isActive, true),
        ),
      )
      .limit(1)
      .all();

    const [project] = projectResults;
    if (!project) {
      throw new Error("Project not found, access denied, or project is inactive");
    }

    // 2. Create the channel
    const channelResults = tx
      .insert(projectChannelsTable)
      .values(data)
      .returning()
      .all();

    const [channel] = channelResults;
    if (!channel) {
      throw new Error("Failed to create project channel");
    }

    return channel;
  });

  return result;
}

/**
 * Update project channel with ownership validation
 */
export async function updateProjectChannel(data: { id: string; ownerId: string; name?: string; description?: string }): Promise<SelectProjectChannel | null> {
  const db = getDatabase();
  
  const { id, ownerId, ...updates } = data;

  const [channel] = await db
    .update(projectChannelsTable)
    .set({
      ...updates,
      updatedAt: sql`(strftime('%s', 'now'))`
    })
    .where(
      and(
        eq(projectChannelsTable.id, id),
        eq(projectChannelsTable.ownerId, ownerId)
      )
    )
    .returning();

  return channel || null;
}

/**
 * List project channels with optional filters and ownership validation
 */
export async function listProjectChannels(filters: {
  projectId: string;
  ownerId: string;
  includeInactive?: boolean;
  includeArchived?: boolean;
}): Promise<Array<SelectProjectChannel & { lastMessage?: { id: string; content: string; authorId: string; createdAt: number; updatedAt: number } }>> {
  const db = getDatabase();
  
  const { projectId, ownerId, includeInactive = false, includeArchived = false } = filters;

  // 1. Get channels for the project with ownership validation
  const channelConditions = [
    eq(projectChannelsTable.projectId, projectId),
    eq(projectChannelsTable.ownerId, ownerId)
  ];

  if (!includeInactive) {
    channelConditions.push(eq(projectChannelsTable.isActive, true));
  }

  if (!includeArchived) {
    channelConditions.push(isNull(projectChannelsTable.archivedAt));
  }

  const channels = await db
    .select()
    .from(projectChannelsTable)
    .where(and(...channelConditions))
    .orderBy(desc(projectChannelsTable.createdAt));

  if (channels.length === 0) {
    return [];
  }

  // 2. Get latest messages for each channel
  const channelIds = channels.map((channel) => channel.id).filter((id): id is string => id !== null);

  const messageConditions = [
    inArray(messagesTable.sourceId, channelIds),
    eq(messagesTable.sourceType, "channel" as const),
  ];

  if (!includeInactive) {
    messageConditions.push(eq(messagesTable.isActive, true));
  }

  const latestMessages = await db
    .select({
      id: messagesTable.id,
      sourceId: messagesTable.sourceId,
      content: messagesTable.content,
      authorId: messagesTable.ownerId, // Map ownerId to authorId for API consistency
      createdAt: messagesTable.createdAt,
      updatedAt: messagesTable.updatedAt,
      rn: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${messagesTable.sourceId} ORDER BY ${messagesTable.createdAt} DESC)`.as(
        "rn",
      ),
    })
    .from(messagesTable)
    .where(and(...messageConditions));

  // 3. Map latest messages by channel
  const latestMessagesMap = new Map();
  for (const message of latestMessages) {
    if (message.rn === 1) {
      latestMessagesMap.set(message.sourceId, {
        id: message.id,
        content: message.content,
        authorId: message.authorId,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      });
    }
  }

  // 4. Combine channels with latest messages
  const result = [];
  for (const channel of channels) {
    const lastMessage = latestMessagesMap.get(channel.id);

    result.push({
      ...channel,
      lastMessage: lastMessage || undefined,
    });
  }

  // 5. Sort by latest activity
  const sortedResult = result.sort((channelA, channelB) => {
    const aTime = channelA.lastMessage?.createdAt || channelA.updatedAt;
    const bTime = channelB.lastMessage?.createdAt || channelB.updatedAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  return sortedResult;
}

/**
 * Archive project channel with ownership validation
 */
export async function archiveProjectChannel(id: string, ownerId: string, archivedBy: string): Promise<SelectProjectChannel | null> {
  const db = getDatabase();

  const [channel] = await db
    .update(projectChannelsTable)
    .set({
      archivedAt: new Date(),
      archivedBy,
    })
    .where(
      and(
        eq(projectChannelsTable.id, id),
        eq(projectChannelsTable.ownerId, ownerId)
      )
    )
    .returning();

  return channel || null;
}

/**
 * Unarchive project channel with ownership validation
 */
export async function unarchiveProjectChannel(id: string, ownerId: string): Promise<SelectProjectChannel | null> {
  const db = getDatabase();

  const [channel] = await db
    .update(projectChannelsTable)
    .set({
      archivedAt: null,
      archivedBy: null,
      updatedAt: sql`(strftime('%s', 'now'))`
    })
    .where(
      and(
        eq(projectChannelsTable.id, id),
        eq(projectChannelsTable.ownerId, ownerId)
      )
    )
    .returning();

  return channel || null;
}

/**
 * Soft delete project channel with ownership validation
 */
export async function inactivateProjectChannel(id: string, ownerId: string, deactivatedBy: string): Promise<SelectProjectChannel | null> {
  const db = getDatabase();

  const [channel] = await db
    .update(projectChannelsTable)
    .set({
      isActive: false,
      deactivatedAt: new Date(),
      deactivatedBy,
    })
    .where(
      and(
        eq(projectChannelsTable.id, id),
        eq(projectChannelsTable.ownerId, ownerId)
      )
    )
    .returning();

  return channel || null;
}

/**
 * Get messages for a channel
 */
export async function getChannelMessages(channelId: string): Promise<SelectMessage[]> {
  const db = getDatabase();

  const conditions = [
    eq(messagesTable.sourceType, "channel"),
    eq(messagesTable.sourceId, channelId),
    eq(messagesTable.isActive, true)
  ];

  const messages = await db
    .select()
    .from(messagesTable)
    .where(and(...conditions))
    .orderBy(asc(messagesTable.createdAt));
    
  return messages;
}

/**
 * Send message to channel
 */
export async function sendChannelMessage(data: InsertMessage): Promise<SelectMessage> {
  const db = getDatabase();

  // 1. Send message to database
  const [message] = await db
    .insert(messagesTable)
    .values(data)
    .returning();

  if (!message) {
    throw new Error("Failed to send message");
  }

  // 2. Emit user-sent-message event
  try {
    logger.debug("📤 Emitting user-sent-message event:", {
      messageId: message.id,
      sourceType: message.sourceType,
      sourceId: message.sourceId
    });

    eventBus.emit("user-sent-message", {
      messageId: message.id,
      conversationId: message.sourceId,
      conversationType: "channel",
      authorId: message.ownerId, // Map ownerId to authorId for event consistency
      content: message.content,
      timestamp: new Date(message.createdAt)
    });

    logger.info("✅ User message event emitted successfully:", {
      messageId: message.id,
      conversationId: message.sourceId
    });
  } catch (error) {
    logger.error("❌ Failed to emit user message event:", error);
    // Don't fail the message sending if event emission fails
  }

  return message;
}