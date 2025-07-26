import { eq, asc, and } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";
import {
  messagesTable,
  llmMessagesTable,
} from "@/main/features/conversation/message.model";
import type {
  SelectMessage,
  InsertMessage,
  InsertLlmMessage,
} from "@/main/features/conversation/message.model";

export type SendMessageInput = Omit<
  InsertMessage,
  "id" | "createdAt" | "updatedAt"
>;

export interface SendLlmMessageInput {
  messageInput: SendMessageInput;
  llmData: Omit<
    InsertLlmMessage,
    "id" | "messageId" | "createdAt" | "updatedAt"
  >;
}

export class MessageService {
  /**
   * Send a message
   */
  static async send(input: SendMessageInput): Promise<SelectMessage> {
    const db = getDatabase();

    console.log("🔍 MESSAGE SERVICE SEND - Input:", {
      "Input data": input,
      "Current time": new Date().toString(),
      "Current timestamp": Date.now(),
      "Timezone offset": new Date().getTimezoneOffset(),
    });

    const [message] = await db.insert(messagesTable).values(input).returning();

    if (!message) {
      throw new Error("Failed to send message");
    }

    console.log("💾 MESSAGE SERVICE SEND - Saved:", {
      "Message from DB": message,
      "createdAt type": typeof message.createdAt,
      "createdAt value": message.createdAt,
      "createdAt as Date": new Date(message.createdAt),
      "createdAt toString": new Date(message.createdAt).toString(),
    });

    return message;
  }

  /**
   * Send message with LLM data
   */
  static async sendWithLlmData(
    input: SendLlmMessageInput,
  ): Promise<SelectMessage> {
    const db = getDatabase();

    return db.transaction(async (tx) => {
      // Inserir mensagem principal
      const [message] = await tx
        .insert(messagesTable)
        .values(input.messageInput)
        .returning();

      if (!message) {
        throw new Error("Failed to send message");
      }

      // Inserir dados LLM associados
      await tx.insert(llmMessagesTable).values({
        messageId: message.id,
        ...input.llmData,
      });

      return message;
    });
  }

  /**
   * Get conversation messages - only returns active messages by default
   */
  static async getConversationMessages(
    conversationId: string,
    includeInactive = false,
  ): Promise<SelectMessage[]> {
    const db = getDatabase();

    const conditions = [eq(messagesTable.conversationId, conversationId)];

    if (!includeInactive) {
      conditions.push(eq(messagesTable.isActive, true));
    }

    const result = await db
      .select()
      .from(messagesTable)
      .where(and(...conditions))
      .orderBy(asc(messagesTable.createdAt));

    console.log("📚 MESSAGE SERVICE GET - Retrieved:", {
      "Conversation ID": conversationId,
      "Messages count": result.length,
      "Include inactive": includeInactive,
      "Sample message": result[0]
        ? {
            id: result[0].id,
            createdAt: result[0].createdAt,
            isActive: result[0].isActive,
            "createdAt type": typeof result[0].createdAt,
            "createdAt as Date": new Date(result[0].createdAt),
            "createdAt toString": new Date(result[0].createdAt).toString(),
          }
        : "No messages",
    });

    return result;
  }

  /**
   * Get message with LLM data - only returns active by default
   */
  static async getMessageWithLlmData(
    messageId: string,
    includeInactive = false,
  ) {
    const db = getDatabase();

    const messageConditions = [eq(messagesTable.id, messageId)];
    const llmConditions = [eq(messagesTable.id, llmMessagesTable.messageId)];

    if (!includeInactive) {
      messageConditions.push(eq(messagesTable.isActive, true));
      llmConditions.push(eq(llmMessagesTable.isActive, true));
    }

    const [result] = await db
      .select({
        message: messagesTable,
        llmMessage: llmMessagesTable,
      })
      .from(messagesTable)
      .leftJoin(llmMessagesTable, and(...llmConditions))
      .where(and(...messageConditions))
      .limit(1);

    return result;
  }

  /**
   * Find message by ID - only returns active by default
   */
  static async findById(
    id: string,
    includeInactive = false,
  ): Promise<SelectMessage | null> {
    const db = getDatabase();

    const conditions = [eq(messagesTable.id, id)];

    if (!includeInactive) {
      conditions.push(eq(messagesTable.isActive, true));
    }

    const [message] = await db
      .select()
      .from(messagesTable)
      .where(and(...conditions))
      .limit(1);

    return message || null;
  }

  /**
   * Soft delete message by ID
   */
  static async softDelete(id: string, deletedBy: string): Promise<void> {
    const db = getDatabase();

    await db.transaction(async (tx) => {
      // Verify message exists and is active
      const [message] = await tx
        .select()
        .from(messagesTable)
        .where(and(eq(messagesTable.id, id), eq(messagesTable.isActive, true)))
        .limit(1);

      if (!message) {
        throw new Error("Message not found or already inactive");
      }

      // Soft delete the message
      await tx
        .update(messagesTable)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(eq(messagesTable.id, id));

      // Cascade soft delete to LLM message data if exists
      await tx
        .update(llmMessagesTable)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(llmMessagesTable.messageId, id),
            eq(llmMessagesTable.isActive, true),
          ),
        );
    });
  }

  /**
   * Restore a soft deleted message
   */
  static async restore(id: string): Promise<SelectMessage> {
    const db = getDatabase();

    return db.transaction(async (tx) => {
      // Restore the message
      const [restored] = await tx
        .update(messagesTable)
        .set({
          isActive: true,
          deactivatedAt: null,
          deactivatedBy: null,
          updatedAt: new Date(),
        })
        .where(and(eq(messagesTable.id, id), eq(messagesTable.isActive, false)))
        .returning();

      if (!restored) {
        throw new Error("Message not found or not in soft deleted state");
      }

      // Restore associated LLM message data
      await tx
        .update(llmMessagesTable)
        .set({
          isActive: true,
          deactivatedAt: null,
          deactivatedBy: null,
          updatedAt: new Date(),
        })
        .where(eq(llmMessagesTable.messageId, id));

      return restored;
    });
  }

  /**
   * Update message content
   */
  static async update(
    id: string,
    input: Partial<InsertMessage>,
  ): Promise<SelectMessage> {
    const db = getDatabase();

    const [updated] = await db
      .update(messagesTable)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(and(eq(messagesTable.id, id), eq(messagesTable.isActive, true)))
      .returning();

    if (!updated) {
      throw new Error("Message not found, inactive, or update failed");
    }

    return updated;
  }

  /**
   * Get messages count for a conversation (active only)
   */
  static async getConversationMessageCount(
    conversationId: string,
  ): Promise<number> {
    const db = getDatabase();

    const result = await db
      .select({ count: messagesTable.id })
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.conversationId, conversationId),
          eq(messagesTable.isActive, true),
        ),
      );

    return result.length;
  }
}
