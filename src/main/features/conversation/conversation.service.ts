import { eq, and } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";

import {
  conversationsTable,
  conversationParticipantsTable,
} from "./conversation.model";

import type {
  SelectConversation,
  InsertConversation,
} from "./conversation.model";

export interface CreateConversationInput
  extends Omit<InsertConversation, "id" | "createdAt" | "updatedAt"> {
  participantIds: string[];
}

export class ConversationService {
  static async create(
    input: CreateConversationInput,
  ): Promise<import("./conversation.types").ConversationWithParticipants> {
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
    const participants = [];
    if (input.participantIds.length > 0) {
      const insertedParticipants = await db.insert(conversationParticipantsTable).values(
        input.participantIds.map((participantId) => ({
          conversationId: conversation.id,
          participantId,
        })),
      ).returning();
      
      participants.push(...insertedParticipants);
    }

    return {
      ...conversation,
      participants,
    };
  }

  static async getUserConversations(
    userId: string,
  ): Promise<import("./conversation.types").ConversationWithParticipants[]> {
    const db = getDatabase();

    const conversations = await db
      .select({ 
        conversation: conversationsTable,
        participant: conversationParticipantsTable
      })
      .from(conversationsTable)
      .innerJoin(
        conversationParticipantsTable,
        eq(conversationsTable.id, conversationParticipantsTable.conversationId),
      )
      .where(eq(conversationParticipantsTable.participantId, userId));

    // Group participants by conversation
    const conversationMap = new Map<string, import("./conversation.types").ConversationWithParticipants>();
    
    for (const row of conversations) {
      const convId = row.conversation.id;
      
      if (!conversationMap.has(convId)) {
        conversationMap.set(convId, {
          ...row.conversation,
          participants: []
        });
      }
      
      const conv = conversationMap.get(convId)!;
      
      // Get all participants for this conversation
      const allParticipants = await db
        .select()
        .from(conversationParticipantsTable)
        .where(eq(conversationParticipantsTable.conversationId, convId));
        
      conv.participants = allParticipants;
    }

    return Array.from(conversationMap.values());
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
          eq(conversationParticipantsTable.participantId, userId),
        ),
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
