import { eq, inArray, sql } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";
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

export interface CreateConversationInput
  extends Omit<InsertConversation, "id" | "createdAt" | "updatedAt"> {
  participantIds: string[];
}

export class ConversationService {
  static async create(
    input: CreateConversationInput,
  ): Promise<ConversationWithParticipants> {
    const db = getDatabase();

    const [conversation] = await db
      .insert(conversationsTable)
      .values({
        name: input.name,
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

  static async getUserConversations(
    userId: string,
  ): Promise<ConversationWithLastMessage[]> {
    const db = getDatabase();

    // 1. Get all conversation IDs for the user
    const userConversations = await db
      .select({
        conversationId: conversationParticipantsTable.conversationId,
      })
      .from(conversationParticipantsTable)
      .where(eq(conversationParticipantsTable.participantId, userId));

    const conversationIds = userConversations.map(
      (userConv) => userConv.conversationId,
    );

    // 2. Get all conversations data in one query
    const conversations = await db
      .select()
      .from(conversationsTable)
      .where(inArray(conversationsTable.id, conversationIds));

    // 3. Get all participants for these conversations in one query
    const allParticipants = await db
      .select()
      .from(conversationParticipantsTable)
      .where(
        inArray(conversationParticipantsTable.conversationId, conversationIds),
      );

    // 4. Get latest message for each conversation using window function
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
      .where(inArray(messagesTable.conversationId, conversationIds));

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
}
