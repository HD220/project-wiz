import { eq, and } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";

import {
  conversationsTable,
  conversationParticipantsTable,
} from "./conversations.schema";

import type {
  SelectConversation,
  InsertConversation,
} from "./conversations.schema";

export interface CreateConversationInput
  extends Omit<InsertConversation, "id" | "createdAt" | "updatedAt"> {
  participantIds: string[];
}

export class ConversationService {
  static async create(
    input: CreateConversationInput,
  ): Promise<SelectConversation> {
    const db = getDatabase();

    const [conversation] = await db
      .insert(conversationsTable)
      .values({
        name: input.name,
        description: input.description,
        type: input.type,
        agentId: input.agentId,
      })
      .returning();

    if (!conversation) {
      throw new Error("Failed to create conversation");
    }

    // Adicionar participantes
    if (input.participantIds.length > 0) {
      await db.insert(conversationParticipantsTable).values(
        input.participantIds.map((participantId) => ({
          conversationId: conversation.id,
          participantId,
        })),
      );
    }

    return conversation;
  }

  static async getUserConversations(
    userId: string,
  ): Promise<SelectConversation[]> {
    const db = getDatabase();

    const conversations = await db
      .select({ conversation: conversationsTable })
      .from(conversationsTable)
      .innerJoin(
        conversationParticipantsTable,
        eq(conversationsTable.id, conversationParticipantsTable.conversationId),
      )
      .where(eq(conversationParticipantsTable.participantId, userId));

    return conversations.map((row) => row.conversation);
  }

  static async getOrCreateAgentConversation(
    userId: string,
    agentId: string,
  ): Promise<SelectConversation> {
    const db = getDatabase();

    const [existingConversation] = await db
      .select({ conversation: conversationsTable })
      .from(conversationsTable)
      .innerJoin(
        conversationParticipantsTable,
        eq(conversationsTable.id, conversationParticipantsTable.conversationId),
      )
      .where(
        and(
          eq(conversationsTable.agentId, agentId),
          eq(conversationParticipantsTable.participantId, userId)
        )
      )
      .limit(1);

    if (existingConversation) {
      return existingConversation.conversation;
    }

    return await this.create({
      type: "agent_chat",
      agentId,
      participantIds: [userId],
    });
  }

  static async getConversationWithAgent(
    conversationId: string,
  ): Promise<SelectConversation | null> {
    const db = getDatabase();

    const [conversation] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, conversationId))
      .limit(1);

    return conversation || null;
  }
}
