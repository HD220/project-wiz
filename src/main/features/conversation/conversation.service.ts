import { eq, inArray, sql, and, isNull } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";
import { AgentService } from "@/main/features/agent/agent.service";
import {
  conversationsTable,
  conversationParticipantsTable,
} from "@/main/features/conversation/conversation.model";
import type { InsertConversation } from "@/main/features/conversation/conversation.model";
import {
  ConversationWithLastMessage,
  ConversationWithParticipants,
} from "@/main/features/conversation/conversation.types";
import { messagesTable } from "@/main/features/conversation/message.model";
import { UserService } from "@/main/features/user/user.service";

export interface CreateConversationInput
  extends Omit<InsertConversation, "id" | "createdAt" | "updatedAt"> {
  participantIds: string[];
}

export class ConversationService {
  /**
   * Generate conversation title based on participants
   * 1 participant: "João Silva"
   * 2 participants: "João Silva, Maria Santos"
   * 3 participants: "João Silva, Maria Santos, Pedro Costa"
   * 4+ participants: "João Silva, Maria Santos, Pedro Costa..."
   */
  private static async generateConversationTitle(
    participantIds: string[],
  ): Promise<string> {
    if (participantIds.length === 0) {
      return "Empty Conversation";
    }

    // Get participant names - inline for simplicity
    const participantNames: string[] = [];
    for (const participantId of participantIds) {
      const user = await UserService.findById(participantId);
      if (user) {
        participantNames.push(user.name);
      }
    }

    if (participantNames.length === 0) {
      return "Unknown Participants";
    }

    // Generate title based on participant count
    if (participantNames.length <= 3) {
      return participantNames.join(", ");
    }

    // For 4+ participants, show first 3 + "..."
    return `${participantNames.slice(0, 3).join(", ")}...`;
  }

  static async create(
    input: CreateConversationInput,
  ): Promise<ConversationWithParticipants> {
    const db = getDatabase();

    // Generate title if name is null/undefined
    const conversationName =
      input.name ||
      (input.participantIds.length > 0
        ? await ConversationService.generateConversationTitle(
            input.participantIds,
          )
        : null);

    const [conversation] = await db
      .insert(conversationsTable)
      .values({
        name: conversationName,
        description: input.description,
        type: input.type,
      })
      .returning();

    if (!conversation) {
      throw new Error("Failed to create conversation");
    }

    // Adicionar participantes
    const participants = [];
    if (input.participantIds.length > 0) {
      const insertedParticipants = await db
        .insert(conversationParticipantsTable)
        .values(
          input.participantIds.map((participantId) => ({
            conversationId: conversation.id,
            participantId,
          })),
        )
        .returning();

      participants.push(...insertedParticipants);
    }

    return {
      ...conversation,
      participants,
    };
  }

  /**
   * Get user conversations with archiving support
   * includeArchived: false (default) - only active non-archived conversations
   * includeArchived: true - include archived conversations
   * includeInactive: false (default) - exclude soft-deleted conversations
   */
  static async getUserConversations(
    userId: string,
    options: {
      includeInactive?: boolean;
      includeArchived?: boolean;
    } = {},
  ): Promise<ConversationWithLastMessage[]> {
    const { includeInactive = false, includeArchived = false } = options;
    const db = getDatabase();

    // 1. Get all conversation IDs for the user (only active participants)
    const participantConditions = [
      eq(conversationParticipantsTable.participantId, userId),
    ];

    if (!includeInactive) {
      participantConditions.push(
        eq(conversationParticipantsTable.isActive, true),
      );
    }

    const userConversations = await db
      .select({
        conversationId: conversationParticipantsTable.conversationId,
      })
      .from(conversationParticipantsTable)
      .where(and(...participantConditions));

    const conversationIds = userConversations.map(
      (userConv) => userConv.conversationId,
    );

    if (conversationIds.length === 0) {
      return [];
    }

    // 2. Get all conversations data with archiving logic
    const conversationConditions = [
      inArray(conversationsTable.id, conversationIds),
    ];

    if (!includeInactive) {
      conversationConditions.push(eq(conversationsTable.isActive, true));
    }

    // Archiving filter logic
    if (!includeArchived) {
      conversationConditions.push(isNull(conversationsTable.archivedAt));
    }

    const conversations = await db
      .select()
      .from(conversationsTable)
      .where(and(...conversationConditions));

    // 3. Get all participants for these conversations in one query (only active participants)
    const participantsConditions = [
      inArray(conversationParticipantsTable.conversationId, conversationIds),
    ];

    if (!includeInactive) {
      participantsConditions.push(
        eq(conversationParticipantsTable.isActive, true),
      );
    }

    const allParticipants = await db
      .select()
      .from(conversationParticipantsTable)
      .where(and(...participantsConditions));

    // 4. Get latest message for each conversation using window function (only active messages)
    const messageConditions = [
      inArray(messagesTable.conversationId, conversationIds),
    ];

    if (!includeInactive) {
      messageConditions.push(eq(messagesTable.isActive, true));
    }

    const latestMessages = await db
      .select({
        id: messagesTable.id,
        conversationId: messagesTable.conversationId,
        content: messagesTable.content,
        authorId: messagesTable.authorId,
        createdAt: messagesTable.createdAt,
        updatedAt: messagesTable.updatedAt,
        rn: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${messagesTable.conversationId} ORDER BY ${messagesTable.createdAt} DESC)`.as(
          "rn",
        ),
      })
      .from(messagesTable)
      .where(and(...messageConditions));

    // Filter to get only the latest message per conversation
    const latestMessagesMap = new Map();
    for (const message of latestMessages) {
      if (message.rn === 1) {
        latestMessagesMap.set(message.conversationId, {
          id: message.id,
          conversationId: message.conversationId,
          content: message.content,
          authorId: message.authorId,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        });
      }
    }

    // 5. Build the result
    const result: ConversationWithLastMessage[] = [];

    for (const conversation of conversations) {
      const participants = allParticipants.filter(
        (participant) => participant.conversationId === conversation.id,
      );
      const lastMessage = latestMessagesMap.get(conversation.id);

      result.push({
        ...conversation,
        participants,
        lastMessage: lastMessage || undefined,
      });
    }

    // Sort by last message time (most recent first)
    return result.sort((convA, convB) => {
      const aTime = convA.lastMessage?.createdAt || convA.updatedAt;
      const bTime = convB.lastMessage?.createdAt || convB.updatedAt;
      return bTime.getTime() - aTime.getTime();
    });
  }

  /**
   * Find conversation by ID - only returns active conversations by default
   */
  static async findById(
    id: string,
    includeInactive = false,
  ): Promise<ConversationWithParticipants | null> {
    const db = getDatabase();

    const conversationConditions = [eq(conversationsTable.id, id)];

    if (!includeInactive) {
      conversationConditions.push(eq(conversationsTable.isActive, true));
    }

    const [conversation] = await db
      .select()
      .from(conversationsTable)
      .where(and(...conversationConditions))
      .limit(1);

    if (!conversation) {
      return null;
    }

    // Get active participants
    const participantConditions = [
      eq(conversationParticipantsTable.conversationId, id),
    ];

    if (!includeInactive) {
      participantConditions.push(
        eq(conversationParticipantsTable.isActive, true),
      );
    }

    const participants = await db
      .select()
      .from(conversationParticipantsTable)
      .where(and(...participantConditions));

    return {
      ...conversation,
      participants,
    };
  }

  /**
   * Archive conversation
   */
  static async archive(
    conversationId: string,
    archivedBy: string,
  ): Promise<void> {
    const db = getDatabase();

    // Verify conversation exists and is active
    const [conversation] = await db
      .select()
      .from(conversationsTable)
      .where(
        and(
          eq(conversationsTable.id, conversationId),
          eq(conversationsTable.isActive, true),
          isNull(conversationsTable.archivedAt), // Not already archived
        ),
      )
      .limit(1);

    if (!conversation) {
      throw new Error("Conversation not found, inactive, or already archived");
    }

    // Archive the conversation
    const [updated] = await db
      .update(conversationsTable)
      .set({
        archivedAt: new Date(),
        archivedBy,
        updatedAt: new Date(),
      })
      .where(eq(conversationsTable.id, conversationId))
      .returning();

    if (!updated) {
      throw new Error("Failed to archive conversation");
    }
  }

  /**
   * Unarchive conversation
   */
  static async unarchive(conversationId: string): Promise<void> {
    const db = getDatabase();

    // Verify conversation exists and is archived
    const [conversation] = await db
      .select()
      .from(conversationsTable)
      .where(
        and(
          eq(conversationsTable.id, conversationId),
          eq(conversationsTable.isActive, true),
        ),
      )
      .limit(1);

    if (!conversation) {
      throw new Error("Conversation not found or inactive");
    }

    if (!conversation.archivedAt) {
      throw new Error("Conversation is not archived");
    }

    // Unarchive the conversation
    const [updated] = await db
      .update(conversationsTable)
      .set({
        archivedAt: null,
        archivedBy: null,
        updatedAt: new Date(),
      })
      .where(eq(conversationsTable.id, conversationId))
      .returning();

    if (!updated) {
      throw new Error("Failed to unarchive conversation");
    }
  }

  /**
   * Soft delete conversation with cascading deletion
   */
  static async softDelete(id: string, deletedBy: string): Promise<void> {
    const db = getDatabase();

    await db.transaction(async (tx) => {
      // Verify conversation exists and is active
      const [conversation] = await tx
        .select()
        .from(conversationsTable)
        .where(
          and(
            eq(conversationsTable.id, id),
            eq(conversationsTable.isActive, true),
          ),
        )
        .limit(1);

      if (!conversation) {
        throw new Error("Conversation not found or already inactive");
      }

      // Soft delete the conversation
      await tx
        .update(conversationsTable)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(eq(conversationsTable.id, id));

      // Cascade soft delete to conversation participants
      await tx
        .update(conversationParticipantsTable)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(conversationParticipantsTable.conversationId, id),
            eq(conversationParticipantsTable.isActive, true),
          ),
        );

      // Cascade soft delete to all messages in the conversation
      await tx
        .update(messagesTable)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(messagesTable.conversationId, id),
            eq(messagesTable.isActive, true),
          ),
        );
    });
  }

  /**
   * Restore a soft deleted conversation
   */
  static async restore(id: string): Promise<ConversationWithParticipants> {
    const db = getDatabase();

    return await db.transaction(async (tx) => {
      // Restore the conversation
      const [restored] = await tx
        .update(conversationsTable)
        .set({
          isActive: true,
          deactivatedAt: null,
          deactivatedBy: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(conversationsTable.id, id),
            eq(conversationsTable.isActive, false),
          ),
        )
        .returning();

      if (!restored) {
        throw new Error("Conversation not found or not in soft deleted state");
      }

      // Restore conversation participants
      await tx
        .update(conversationParticipantsTable)
        .set({
          isActive: true,
          deactivatedAt: null,
          deactivatedBy: null,
          updatedAt: new Date(),
        })
        .where(eq(conversationParticipantsTable.conversationId, id));

      // Get restored participants
      const participants = await tx
        .select()
        .from(conversationParticipantsTable)
        .where(eq(conversationParticipantsTable.conversationId, id));

      return {
        ...restored,
        participants,
      };
    });
  }

  /**
   * FIXED: Check if conversation is blocked based on SPECIFIC PARTICIPANT agents
   * Only checks agents that are actually participants in this conversation
   */
  static async isConversationBlocked(conversationId: string): Promise<{
    isBlocked: boolean;
    reason?: string;
    activeAgentsCount: number;
  }> {
    // Get active agents that are SPECIFIC PARTICIPANTS in this conversation
    const activeAgents =
      await AgentService.getActiveAgentsForConversation(conversationId);
    const activeAgentsCount = activeAgents.length;

    if (activeAgentsCount === 0) {
      return {
        isBlocked: true,
        reason: "No active agent participants available for this conversation",
        activeAgentsCount: 0,
      };
    }

    return {
      isBlocked: false,
      activeAgentsCount,
    };
  }

  /**
   * Update conversation metadata
   */
  static async update(
    id: string,
    input: Partial<InsertConversation>,
  ): Promise<ConversationWithParticipants> {
    const db = getDatabase();

    const [updated] = await db
      .update(conversationsTable)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(conversationsTable.id, id),
          eq(conversationsTable.isActive, true),
        ),
      )
      .returning();

    if (!updated) {
      throw new Error("Conversation not found, inactive, or update failed");
    }

    // Get participants
    const participants = await db
      .select()
      .from(conversationParticipantsTable)
      .where(
        and(
          eq(conversationParticipantsTable.conversationId, id),
          eq(conversationParticipantsTable.isActive, true),
        ),
      );

    return {
      ...updated,
      participants,
    };
  }

  /**
   * Regenerate titles for conversations that don't have names
   * Useful for existing conversations created before title generation was implemented
   */
  static async regenerateMissingTitles(): Promise<void> {
    const db = getDatabase();

    // Find conversations without names that are active
    const conversationsWithoutNames = await db
      .select({
        id: conversationsTable.id,
      })
      .from(conversationsTable)
      .where(
        and(
          eq(conversationsTable.isActive, true),
          sql`${conversationsTable.name} IS NULL OR ${conversationsTable.name} = ''`,
        ),
      );

    if (conversationsWithoutNames.length === 0) {
      return;
    }

    // Process each conversation
    for (const conversation of conversationsWithoutNames) {
      try {
        // Get participants for this conversation
        const participants = await db
          .select({
            participantId: conversationParticipantsTable.participantId,
          })
          .from(conversationParticipantsTable)
          .where(
            and(
              eq(conversationParticipantsTable.conversationId, conversation.id),
              eq(conversationParticipantsTable.isActive, true),
            ),
          );

        const participantIds = participants.map((p) => p.participantId);

        // Generate title for this conversation
        const generatedTitle =
          await ConversationService.generateConversationTitle(participantIds);

        // Update conversation with generated title
        await db
          .update(conversationsTable)
          .set({
            name: generatedTitle,
            updatedAt: new Date(),
          })
          .where(eq(conversationsTable.id, conversation.id));
      } catch (error) {
        console.error(
          `Failed to regenerate title for conversation ${conversation.id}:`,
          error,
        );
      }
    }
  }
}
