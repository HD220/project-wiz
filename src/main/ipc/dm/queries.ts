import { eq, and, inArray, isNull, sql, asc } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/config/database";
import {
  dmConversationsTable,
  dmParticipantsTable,
  type SelectDMConversation,
  type InsertDMConversation,
  type SelectDMParticipant,
  type InsertDMParticipant
} from "@/main/schemas/dm-conversation.schema";
import { messagesTable, type SelectMessage, type InsertMessage } from "@/main/schemas/message.schema";
import { usersTable } from "@/main/schemas/user.schema";
import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";

const { getDatabase } = createDatabaseConnection(true);
const logger = getLogger("dm.queries");

/**
 * Generate DM conversation title from participant names
 */
async function generateDMTitle(
  participantIds: string[],
  currentUserId?: string,
): Promise<string> {
  const otherParticipantIds = currentUserId
    ? participantIds.filter((id) => id !== currentUserId)
    : participantIds;

  if (otherParticipantIds.length === 0) {
    return "Self Conversation";
  }

  const participantNames: string[] = [];
  for (const participantId of otherParticipantIds) {
    const db = getDatabase();
    const [user] = await db
      .select({ name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, participantId))
      .limit(1);
    if (user) {
      participantNames.push(user.name);
    }
  }

  if (participantNames.length === 0) {
    return "Unknown Participants";
  }

  if (participantNames.length <= 3) {
    return participantNames.join(", ");
  }

  return `${participantNames.slice(0, 3).join(", ")}...`;
}

/**
 * Find DM conversation by ID with ownership validation
 */
export async function findDMConversation(id: string, ownerId: string): Promise<SelectDMConversation | null> {
  const db = getDatabase();
  
  const [conversation] = await db
    .select()
    .from(dmConversationsTable)
    .where(
      and(
        eq(dmConversationsTable.id, id),
        eq(dmConversationsTable.ownerId, ownerId)
      )
    )
    .limit(1);

  return conversation || null;
}

/**
 * Find DM conversation by ID without ownership validation (for system operations)
 */
export async function findDMConversationById(id: string): Promise<SelectDMConversation | null> {
  const db = getDatabase();
  
  const [conversation] = await db
    .select()
    .from(dmConversationsTable)
    .where(eq(dmConversationsTable.id, id))
    .limit(1);

  return conversation || null;
}

/**
 * Create new DM conversation with participants
 */
export async function createDMConversation(data: InsertDMConversation & { 
  participantIds: string[]; 
  currentUserId: string 
}): Promise<SelectDMConversation> {
  const db = getDatabase();
  
  // Validate that all participant IDs exist
  const existingUsers = await db
    .select({ id: usersTable.id, name: usersTable.name })
    .from(usersTable)
    .where(inArray(usersTable.id, data.participantIds));

  const existingUserIds = new Set(existingUsers.map((user) => user.id));
  const invalidParticipantIds = data.participantIds.filter(
    (id) => !existingUserIds.has(id),
  );

  if (invalidParticipantIds.length > 0) {
    throw new Error(
      `Invalid participant IDs: ${invalidParticipantIds.join(", ")}`,
    );
  }

  const conversationName = await generateDMTitle(
    data.participantIds,
    data.currentUserId,
  );

  // Use synchronous transaction pattern for better-sqlite3
  return db.transaction((tx) => {
    // 1. Create DM conversation
    const dmConversationResults = tx
      .insert(dmConversationsTable)
      .values({
        ...data,
        name: conversationName,
      })
      .returning()
      .all();

    const [dmConversation] = dmConversationResults;
    if (!dmConversation || !dmConversation.id) {
      throw new Error("Failed to create DM conversation");
    }

    // 2. Add participants
    const participantValues = data.participantIds.map((participantId) => ({
      ownerId: data.ownerId,
      dmConversationId: dmConversation.id,
      participantId,
      isActive: true
    }));

    tx
      .insert(dmParticipantsTable)
      .values(participantValues)
      .returning()
      .all();

    return dmConversation;
  });
}

/**
 * List DM conversations for user with optional filters
 */
export async function listUserDMConversations(filters: {
  ownerId: string;
  includeInactive?: boolean;
  includeArchived?: boolean;
}): Promise<Array<SelectDMConversation & { 
  participants: SelectDMParticipant[];
  lastMessage?: {
    id: string;
    content: string;
    authorId: string;
    createdAt: number;
    updatedAt: number;
  };
}>> {
  const db = getDatabase();
  
  const { ownerId, includeInactive = false, includeArchived = false } = filters;

  // 1. Find DM conversations where the user is a participant
  const participantConditions = [
    eq(dmParticipantsTable.participantId, ownerId),
  ];

  if (!includeInactive) {
    participantConditions.push(eq(dmParticipantsTable.isActive, true));
  }

  const userDMConversations = await db
    .select({
      dmConversationId: dmParticipantsTable.dmConversationId,
    })
    .from(dmParticipantsTable)
    .where(and(...participantConditions));

  const dmConversationIds = userDMConversations.map(
    (userConv) => userConv.dmConversationId,
  );

  if (dmConversationIds.length === 0) {
    return [];
  }

  // 2. Get conversations with filters
  const conversationConditions = [
    inArray(dmConversationsTable.id, dmConversationIds),
  ];

  if (!includeInactive) {
    conversationConditions.push(eq(dmConversationsTable.isActive, true));
  }

  if (!includeArchived) {
    conversationConditions.push(isNull(dmConversationsTable.archivedAt));
  }

  const dmConversations = await db
    .select()
    .from(dmConversationsTable)
    .where(and(...conversationConditions));

  // 3. Get all participants for these conversations
  const participantQueryConditions = [
    inArray(dmParticipantsTable.dmConversationId, dmConversationIds),
  ];

  if (!includeInactive) {
    participantQueryConditions.push(eq(dmParticipantsTable.isActive, true));
  }

  const allParticipants = await db
    .select()
    .from(dmParticipantsTable)
    .where(and(...participantQueryConditions));

  // 4. Get latest messages
  const messageConditions = [
    inArray(messagesTable.sourceId, dmConversationIds),
    eq(messagesTable.sourceType, "dm" as const),
  ];

  if (!includeInactive) {
    messageConditions.push(eq(messagesTable.isActive, true));
  }

  const latestMessages = await db
    .select({
      id: messagesTable.id,
      content: messagesTable.content,
      authorId: messagesTable.ownerId, // Map ownerId to authorId for API consistency
      sourceId: messagesTable.sourceId,
      createdAt: messagesTable.createdAt,
      updatedAt: messagesTable.updatedAt,
    })
    .from(messagesTable)
    .where(and(...messageConditions));

  // 5. Combine data
  const result = dmConversations.map((conversation) => {
    const conversationParticipants = allParticipants.filter(
      (participant) => participant.dmConversationId === conversation.id,
    );

    // Find latest message for this conversation
    const conversationMessages = latestMessages.filter(
      (message) => message.sourceId === conversation.id,
    );
    
    const lastMessage = conversationMessages.length > 0 
      ? conversationMessages.reduce((latest, current) => 
          current.createdAt > latest.createdAt ? current : latest
        )
      : undefined;

    return {
      ...conversation,
      participants: conversationParticipants,
      lastMessage: lastMessage ? {
        id: lastMessage.id,
        content: lastMessage.content,
        authorId: lastMessage.authorId,
        createdAt: typeof lastMessage.createdAt === 'number' ? lastMessage.createdAt : lastMessage.createdAt.getTime(),
        updatedAt: typeof lastMessage.updatedAt === 'number' ? lastMessage.updatedAt : lastMessage.updatedAt.getTime(),
      } : undefined,
    };
  });

  return result;
}

/**
 * Archive DM conversation with ownership validation
 */
export async function archiveDMConversation(id: string, ownerId: string, archivedBy: string): Promise<SelectDMConversation | null> {
  const db = getDatabase();

  const [conversation] = await db
    .update(dmConversationsTable)
    .set({
      archivedAt: new Date(),
      archivedBy,
    })
    .where(
      and(
        eq(dmConversationsTable.id, id),
        eq(dmConversationsTable.ownerId, ownerId)
      )
    )
    .returning();

  return conversation || null;
}

/**
 * Unarchive DM conversation with ownership validation
 */
export async function unarchiveDMConversation(id: string, ownerId: string): Promise<SelectDMConversation | null> {
  const db = getDatabase();

  const [conversation] = await db
    .update(dmConversationsTable)
    .set({
      archivedAt: null,
      archivedBy: null,
      updatedAt: sql`(strftime('%s', 'now'))`
    })
    .where(
      and(
        eq(dmConversationsTable.id, id),
        eq(dmConversationsTable.ownerId, ownerId)
      )
    )
    .returning();

  return conversation || null;
}

/**
 * Soft delete DM conversation with ownership validation
 */
export async function inactivateDMConversation(id: string, ownerId: string, deactivatedBy: string): Promise<SelectDMConversation | null> {
  const db = getDatabase();

  const [conversation] = await db
    .update(dmConversationsTable)
    .set({
      isActive: false,
      deactivatedAt: new Date(),
      deactivatedBy,
    })
    .where(
      and(
        eq(dmConversationsTable.id, id),
        eq(dmConversationsTable.ownerId, ownerId)
      )
    )
    .returning();

  return conversation || null;
}

/**
 * Add participant to DM conversation
 */
export async function addDMParticipant(data: InsertDMParticipant): Promise<SelectDMParticipant> {
  const db = getDatabase();

  const [participant] = await db
    .insert(dmParticipantsTable)
    .values(data)
    .returning();

  if (!participant) {
    throw new Error("Failed to add participant to DM conversation");
  }

  return participant;
}

/**
 * Remove participant from DM conversation
 */
export async function removeDMParticipant(conversationId: string, participantId: string, ownerId: string): Promise<boolean> {
  const db = getDatabase();

  const result = await db
    .update(dmParticipantsTable)
    .set({
      isActive: false,
      deactivatedAt: new Date(),
      deactivatedBy: ownerId,
    })
    .where(
      and(
        eq(dmParticipantsTable.dmConversationId, conversationId),
        eq(dmParticipantsTable.participantId, participantId),
        eq(dmParticipantsTable.ownerId, ownerId)
      )
    );

  return result.changes > 0;
}

/**
 * Get messages for a DM conversation with optional limit
 */
export async function getDMMessages(conversationId: string, options?: { limit?: number }): Promise<SelectMessage[]> {
  const db = getDatabase();

  const conditions = [
    eq(messagesTable.sourceType, "dm"),
    eq(messagesTable.sourceId, conversationId),
    eq(messagesTable.isActive, true)
  ];

  let query = db
    .select()
    .from(messagesTable)
    .where(and(...conditions))
    .orderBy(asc(messagesTable.createdAt));

  if (options?.limit) {
    const messages = await query.limit(options.limit);
    return messages;
  }

  const messages = await query;
  return messages;
}

/**
 * Send message to DM conversation
 */
export async function sendDMMessage(data: InsertMessage): Promise<SelectMessage> {
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
      conversationType: "dm",
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