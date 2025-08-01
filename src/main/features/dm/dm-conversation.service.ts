import { eq, and, sql, isNull, inArray } from "drizzle-orm";

import { createDatabaseConnection } from "@/shared/database/config";

const { getDatabase } = createDatabaseConnection(true);
import { messagesTable } from "@/main/features/message/message.model";
import { UserService } from "@/main/features/user/user.service";

import {
  dmConversationsTable,
  dmParticipantsTable,
} from "./dm-conversation.model";

import type {
  CreateDMConversationInput,
  DMConversationWithParticipants,
  DMConversationWithLastMessage,
  DMConversationFilters,
} from "./dm-conversation.types";

const generateDMTitle = async (
  participantIds: string[],
  currentUserId?: string,
): Promise<string> => {
  const otherParticipantIds = currentUserId
    ? participantIds.filter((id) => id !== currentUserId)
    : participantIds;

  if (otherParticipantIds.length === 0) {
    return "Self Conversation";
  }

  const participantNames: string[] = [];
  for (const participantId of otherParticipantIds) {
    const user = await UserService.findById(participantId);
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
};

export const dmConversationService = {
  async create(
    input: CreateDMConversationInput,
  ): Promise<DMConversationWithParticipants> {
    const db = getDatabase();

    const conversationName = await generateDMTitle(
      input.participantIds,
      input.currentUserId,
    );

    const result = await db.transaction((tx) => {
      const dmConversationResults = tx
        .insert(dmConversationsTable)
        .values({
          name: conversationName,
          description: input.description,
        })
        .returning()
        .all();

      const [dmConversation] = dmConversationResults;
      if (!dmConversation) {
        throw new Error("Failed to create DM conversation");
      }

      const participants = [];
      if (input.participantIds.length > 0) {
        const insertedParticipants = tx
          .insert(dmParticipantsTable)
          .values(
            input.participantIds.map((participantId) => ({
              dmConversationId: dmConversation.id,
              participantId,
            })),
          )
          .returning()
          .all();

        participants.push(...insertedParticipants);
      }

      return {
        ...dmConversation,
        participants,
      };
    });

    return result;
  },

  async getUserDMConversations(
    userId: string,
    filters: DMConversationFilters = {},
  ): Promise<DMConversationWithLastMessage[]> {
    const { includeInactive = false, includeArchived = false } = filters;
    const db = getDatabase();

    const participantConditions = [
      eq(dmParticipantsTable.participantId, userId),
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
        sourceId: messagesTable.sourceId,
        content: messagesTable.content,
        authorId: messagesTable.authorId,
        createdAt: messagesTable.createdAt,
        updatedAt: messagesTable.updatedAt,
        rn: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${messagesTable.sourceId} ORDER BY ${messagesTable.createdAt} DESC)`.as(
          "rn",
        ),
      })
      .from(messagesTable)
      .where(and(...messageConditions));

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

    const result: DMConversationWithLastMessage[] = [];

    for (const dmConversation of dmConversations) {
      const participants = allParticipants.filter(
        (participant) => participant.dmConversationId === dmConversation.id,
      );
      const lastMessage = latestMessagesMap.get(dmConversation.id);

      result.push({
        ...dmConversation,
        participants,
        lastMessage: lastMessage || undefined,
      });
    }

    return result.sort((convA, convB) => {
      const aTime = convA.lastMessage?.createdAt || convA.updatedAt;
      const bTime = convB.lastMessage?.createdAt || convB.updatedAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  },

  async findById(
    id: string,
    includeInactive = false,
  ): Promise<DMConversationWithParticipants | null> {
    const db = getDatabase();

    const conversationConditions = [eq(dmConversationsTable.id, id)];

    if (!includeInactive) {
      conversationConditions.push(eq(dmConversationsTable.isActive, true));
    }

    const [dmConversation] = await db
      .select()
      .from(dmConversationsTable)
      .where(and(...conversationConditions))
      .limit(1);

    if (!dmConversation) {
      return null;
    }

    const participantConditions = [
      eq(dmParticipantsTable.dmConversationId, id),
    ];

    if (!includeInactive) {
      participantConditions.push(eq(dmParticipantsTable.isActive, true));
    }

    const participants = await db
      .select()
      .from(dmParticipantsTable)
      .where(and(...participantConditions));

    return {
      ...dmConversation,
      participants,
    };
  },

  async archive(dmId: string, archivedBy: string): Promise<void> {
    const db = getDatabase();

    const [dmConversation] = await db
      .select()
      .from(dmConversationsTable)
      .where(
        and(
          eq(dmConversationsTable.id, dmId),
          eq(dmConversationsTable.isActive, true),
          isNull(dmConversationsTable.archivedAt),
        ),
      )
      .limit(1);

    if (!dmConversation) {
      throw new Error(
        "DM conversation not found, inactive, or already archived",
      );
    }

    const [updated] = await db
      .update(dmConversationsTable)
      .set({
        archivedAt: new Date(),
        archivedBy,
        updatedAt: new Date(),
      })
      .where(eq(dmConversationsTable.id, dmId))
      .returning();

    if (!updated) {
      throw new Error("Failed to archive DM conversation");
    }
  },

  async unarchive(dmId: string): Promise<void> {
    const db = getDatabase();

    const [dmConversation] = await db
      .select()
      .from(dmConversationsTable)
      .where(
        and(
          eq(dmConversationsTable.id, dmId),
          eq(dmConversationsTable.isActive, true),
        ),
      )
      .limit(1);

    if (!dmConversation) {
      throw new Error("DM conversation not found or inactive");
    }

    if (!dmConversation.archivedAt) {
      throw new Error("DM conversation is not archived");
    }

    const [updated] = await db
      .update(dmConversationsTable)
      .set({
        archivedAt: null,
        archivedBy: null,
        updatedAt: new Date(),
      })
      .where(eq(dmConversationsTable.id, dmId))
      .returning();

    if (!updated) {
      throw new Error("Failed to unarchive DM conversation");
    }
  },

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    const db = getDatabase();

    const result = await db.transaction((tx) => {
      const dmConversationResults = tx
        .select()
        .from(dmConversationsTable)
        .where(
          and(
            eq(dmConversationsTable.id, id),
            eq(dmConversationsTable.isActive, true),
          ),
        )
        .limit(1)
        .all();

      const [dmConversation] = dmConversationResults;

      if (!dmConversation) {
        throw new Error("DM conversation not found or already inactive");
      }

      tx.update(dmConversationsTable)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(eq(dmConversationsTable.id, id))
        .run();

      tx.update(dmParticipantsTable)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(dmParticipantsTable.dmConversationId, id),
            eq(dmParticipantsTable.isActive, true),
          ),
        )
        .run();

      tx.update(messagesTable)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(messagesTable.sourceId, id),
            eq(messagesTable.sourceType, "dm"),
            eq(messagesTable.isActive, true),
          ),
        )
        .run();

      return true;
    });

    return result;
  },

  async restore(id: string): Promise<DMConversationWithParticipants> {
    const db = getDatabase();

    const result = await db.transaction((tx) => {
      const restoredResults = tx
        .update(dmConversationsTable)
        .set({
          isActive: true,
          deactivatedAt: null,
          deactivatedBy: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(dmConversationsTable.id, id),
            eq(dmConversationsTable.isActive, false),
          ),
        )
        .returning()
        .all();

      const [restored] = restoredResults;
      if (!restored) {
        throw new Error(
          "DM conversation not found or not in soft deleted state",
        );
      }

      tx.update(dmParticipantsTable)
        .set({
          isActive: true,
          deactivatedAt: null,
          deactivatedBy: null,
          updatedAt: new Date(),
        })
        .where(eq(dmParticipantsTable.dmConversationId, id))
        .run();

      const participants = tx
        .select()
        .from(dmParticipantsTable)
        .where(eq(dmParticipantsTable.dmConversationId, id))
        .all();

      return {
        ...restored,
        participants,
      };
    });

    return result;
  },

  async addParticipant(dmId: string, participantId: string): Promise<void> {
    const db = getDatabase();

    const [participant] = await db
      .insert(dmParticipantsTable)
      .values({
        dmConversationId: dmId,
        participantId,
      })
      .returning();

    if (!participant) {
      throw new Error("Failed to add participant to DM conversation");
    }
  },

  async removeParticipant(
    dmId: string,
    participantId: string,
    removedBy: string,
  ): Promise<void> {
    const db = getDatabase();

    const [updated] = await db
      .update(dmParticipantsTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: removedBy,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(dmParticipantsTable.dmConversationId, dmId),
          eq(dmParticipantsTable.participantId, participantId),
          eq(dmParticipantsTable.isActive, true),
        ),
      )
      .returning();

    if (!updated) {
      throw new Error(
        "Participant not found in DM conversation or already removed",
      );
    }
  },
};
