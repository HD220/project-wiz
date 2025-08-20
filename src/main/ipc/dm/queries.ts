import { eq, and, inArray, isNull, sql, asc } from "drizzle-orm";

import {
  directMessagesTable,
  directMessageParticipantsTable,
  type SelectDirectMessage,
  type SelectDirectMessageParticipant,
  type InsertDirectMessageParticipant,
} from "@/main/schemas/direct-message.schema";
import {
  messagesTable,
  type SelectMessage,
} from "@/main/schemas/message.schema";
import { usersTable } from "@/main/schemas/user.schema";

import { createDatabaseConnection } from "@/shared/config/database";

const { getDatabase } = createDatabaseConnection(true);

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
 * Find DM conversation by ID with ownership validation and participants
 */
export async function findDMConversation(
  id: string,
  ownerId: string,
): Promise<
  | (SelectDirectMessage & { participants: SelectDirectMessageParticipant[] })
  | null
> {
  const db = getDatabase();

  // Get conversation
  const [conversation] = await db
    .select()
    .from(directMessagesTable)
    .where(
      and(
        eq(directMessagesTable.id, id),
        eq(directMessagesTable.ownerId, ownerId),
      ),
    )
    .limit(1);

  if (!conversation) {
    return null;
  }

  // Get participants for this conversation
  const participants = await db
    .select()
    .from(directMessageParticipantsTable)
    .where(
      and(
        eq(directMessageParticipantsTable.directMessageId, id),
        eq(directMessageParticipantsTable.ownerId, ownerId),
      ),
    );

  return {
    ...conversation,
    participants,
  };
}

/**
 * Find DM conversation by ID without ownership validation (for system operations)
 */
export async function findDMConversationById(
  id: string,
): Promise<SelectDirectMessage | null> {
  const db = getDatabase();

  const [conversation] = await db
    .select()
    .from(directMessagesTable)
    .where(eq(directMessagesTable.id, id))
    .limit(1);

  return conversation || null;
}

/**
 * Create new DM conversation with participants
 */
export async function createDMConversation(data: {
  ownerId: string;
  participantIds: string[];
}): Promise<SelectDirectMessage> {
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
    data.ownerId,
  );

  // Use synchronous transaction pattern for better-sqlite3
  return db.transaction((tx) => {
    // 1. Create DM conversation
    const dmConversationResults = tx
      .insert(directMessagesTable)
      .values({
        ownerId: data.ownerId,
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
      directMessageId: dmConversation.id,
      participantId,
    }));

    tx.insert(directMessageParticipantsTable)
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
}): Promise<
  Array<
    SelectDirectMessage & {
      participants: SelectDirectMessageParticipant[];
      lastMessage?: {
        id: string;
        content: string;
        authorId: string;
        createdAt: number;
        updatedAt: number;
      };
    }
  >
> {
  const db = getDatabase();

  const { ownerId, includeInactive = false, includeArchived = false } = filters;

  // 1. Find DM conversations where the user is a participant
  const participantConditions = [
    eq(directMessageParticipantsTable.participantId, ownerId),
  ];

  if (!includeInactive) {
    participantConditions.push(
      isNull(directMessageParticipantsTable.deactivatedAt),
    );
  }

  const userDMConversations = await db
    .select({
      directMessageId: directMessageParticipantsTable.directMessageId,
    })
    .from(directMessageParticipantsTable)
    .where(and(...participantConditions));

  const directMessageIds = userDMConversations.map(
    (userConv) => userConv.directMessageId,
  );

  if (directMessageIds.length === 0) {
    return [];
  }

  // 2. Get conversations with filters
  const conversationConditions = [
    inArray(directMessagesTable.id, directMessageIds),
  ];

  if (!includeInactive) {
    conversationConditions.push(isNull(directMessagesTable.deactivatedAt));
  }

  if (!includeArchived) {
    conversationConditions.push(isNull(directMessagesTable.archivedAt));
  }

  const dmConversations = await db
    .select()
    .from(directMessagesTable)
    .where(and(...conversationConditions));

  // 3. Get all participants for these conversations
  const participantQueryConditions = [
    inArray(directMessageParticipantsTable.directMessageId, directMessageIds),
  ];

  if (!includeInactive) {
    participantQueryConditions.push(
      isNull(directMessageParticipantsTable.deactivatedAt),
    );
  }

  const allParticipants = await db
    .select()
    .from(directMessageParticipantsTable)
    .where(and(...participantQueryConditions));

  // 4. Get latest messages
  const messageConditions = [
    inArray(messagesTable.sourceId, directMessageIds),
    eq(messagesTable.sourceType, "dm" as const),
  ];

  if (!includeInactive) {
    messageConditions.push(isNull(messagesTable.deactivatedAt));
  }

  const latestMessages = await db
    .select({
      id: messagesTable.id,
      content: messagesTable.content,
      authorId: messagesTable.authorId, // Now we have proper authorId field
      sourceId: messagesTable.sourceId,
      createdAt: messagesTable.createdAt,
      updatedAt: messagesTable.updatedAt,
    })
    .from(messagesTable)
    .where(and(...messageConditions));

  // 5. Combine data
  const result = dmConversations.map((conversation) => {
    const conversationParticipants = allParticipants.filter(
      (participant) => participant.directMessageId === conversation.id,
    );

    // Find latest message for this conversation
    const conversationMessages = latestMessages.filter(
      (message) => message.sourceId === conversation.id,
    );

    const lastMessage =
      conversationMessages.length > 0
        ? conversationMessages.reduce((latest, current) =>
            current.createdAt > latest.createdAt ? current : latest,
          )
        : undefined;

    return {
      ...conversation,
      participants: conversationParticipants,
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            content: lastMessage.content,
            authorId: lastMessage.authorId,
            createdAt:
              typeof lastMessage.createdAt === "number"
                ? lastMessage.createdAt
                : lastMessage.createdAt.getTime(),
            updatedAt:
              typeof lastMessage.updatedAt === "number"
                ? lastMessage.updatedAt
                : lastMessage.updatedAt.getTime(),
          }
        : undefined,
    };
  });

  return result;
}

/**
 * Archive DM conversation with ownership validation
 */
export async function archiveDMConversation(data: {
  ownerId: string;
  id: string;
}): Promise<SelectDirectMessage | null> {
  const db = getDatabase();

  const [conversation] = await db
    .update(directMessagesTable)
    .set({
      archivedAt: new Date(),
    })
    .where(
      and(
        eq(directMessagesTable.id, data.id),
        eq(directMessagesTable.ownerId, data.ownerId),
      ),
    )
    .returning();

  return conversation || null;
}

/**
 * Unarchive DM conversation with ownership validation
 */
export async function unarchiveDMConversation(data: {
  ownerId: string;
  id: string;
}): Promise<SelectDirectMessage | null> {
  const db = getDatabase();

  const [conversation] = await db
    .update(directMessagesTable)
    .set({
      archivedAt: null,
      updatedAt: sql`(strftime('%s', 'now'))`,
    })
    .where(
      and(
        eq(directMessagesTable.id, data.id),
        eq(directMessagesTable.ownerId, data.ownerId),
      ),
    )
    .returning();

  return conversation || null;
}

/**
 * Soft delete DM conversation with ownership validation
 */
export async function inactivateDMConversation(
  id: string,
  ownerId: string,
): Promise<SelectDirectMessage | null> {
  const db = getDatabase();

  const [conversation] = await db
    .update(directMessagesTable)
    .set({
      deactivatedAt: new Date(),
    })
    .where(
      and(
        eq(directMessagesTable.id, id),
        eq(directMessagesTable.ownerId, ownerId),
      ),
    )
    .returning();

  return conversation || null;
}

/**
 * Add participant to DM conversation
 */
export async function addDMParticipant(
  data: InsertDirectMessageParticipant,
): Promise<SelectDirectMessageParticipant> {
  const db = getDatabase();

  const [participant] = await db
    .insert(directMessageParticipantsTable)
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
export async function removeDMParticipant(
  conversationId: string,
  participantId: string,
  ownerId: string,
): Promise<boolean> {
  const db = getDatabase();

  const result = await db
    .update(directMessageParticipantsTable)
    .set({
      deactivatedAt: new Date(),
    })
    .where(
      and(
        eq(directMessageParticipantsTable.directMessageId, conversationId),
        eq(directMessageParticipantsTable.participantId, participantId),
        eq(directMessageParticipantsTable.ownerId, ownerId),
      ),
    );

  return result.changes > 0;
}

/**
 * Get messages for a DM conversation with optional limit
 */
export async function getDMMessages(
  conversationId: string,
  options?: { limit?: number },
): Promise<SelectMessage[]> {
  const db = getDatabase();

  const conditions = [
    eq(messagesTable.sourceType, "dm"),
    eq(messagesTable.sourceId, conversationId),
    isNull(messagesTable.deactivatedAt),
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
 * Get all agent participants in a DM conversation
 */
export async function getDMConversationAgents(
  conversationId: string,
): Promise<Array<{ id: string; name: string }>> {
  const db = getDatabase();

  const agents = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
    })
    .from(directMessageParticipantsTable)
    .innerJoin(
      usersTable,
      eq(directMessageParticipantsTable.participantId, usersTable.id),
    )
    .where(
      and(
        eq(directMessageParticipantsTable.directMessageId, conversationId),
        eq(usersTable.type, "agent"),
        isNull(directMessageParticipantsTable.deactivatedAt),
        isNull(usersTable.deactivatedAt),
      ),
    );

  return agents;
}

/**
 * Send message to DM conversation
 */
export async function sendDMMessage(data: {
  authorId: string;
  sourceType: "dm";
  sourceId: string;
  content: string;
  ownerId?: string; // Optional - will be inferred from DM conversation if not provided
}): Promise<SelectMessage> {
  const db = getDatabase();

  // 1. Get DM conversation to determine ownerId if not provided
  let ownerId = data.ownerId;
  if (!ownerId) {
    const dmConversation = await db
      .select({ ownerId: directMessagesTable.ownerId })
      .from(directMessagesTable)
      .where(eq(directMessagesTable.id, data.sourceId))
      .get();

    if (!dmConversation) {
      throw new Error(`DM conversation ${data.sourceId} not found`);
    }

    ownerId = dmConversation.ownerId;
  }

  // 2. Send message to database with correct ownership
  const [message] = await db
    .insert(messagesTable)
    .values({
      sourceType: data.sourceType,
      sourceId: data.sourceId,
      ownerId: ownerId, // Who OWNS the conversation
      authorId: data.authorId, // Who WROTE the message
      content: data.content,
    })
    .returning();

  if (!message) {
    throw new Error("Failed to send message");
  }

  return message;
}
