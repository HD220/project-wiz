import { eq, asc, and } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";

import { messagesTable, llmMessagesTable } from "./message.model";

import type {
  SelectMessage,
  SendMessageInput,
  SendLlmMessageInput,
  MessageSourceType,
} from "./message.types";

export const messageService = {
  async send(input: SendMessageInput): Promise<SelectMessage> {
    const db = getDatabase();

    const [message] = await db.insert(messagesTable).values(input).returning();

    if (!message) {
      throw new Error("Failed to send message");
    }

    return message;
  },

  async sendToDM(
    dmId: string,
    authorId: string,
    content: string,
  ): Promise<SelectMessage> {
    return this.send({
      sourceType: "dm",
      sourceId: dmId,
      authorId,
      content,
    });
  },

  async sendToChannel(
    channelId: string,
    authorId: string,
    content: string,
  ): Promise<SelectMessage> {
    return this.send({
      sourceType: "channel",
      sourceId: channelId,
      authorId,
      content,
    });
  },

  async sendWithLlmData(input: SendLlmMessageInput): Promise<SelectMessage> {
    const db = getDatabase();

    return db.transaction((tx) => {
      const messageResults = tx
        .insert(messagesTable)
        .values(input.messageInput)
        .returning()
        .all();

      const [message] = messageResults;
      if (!message) {
        throw new Error("Failed to send message");
      }

      tx.insert(llmMessagesTable)
        .values({
          messageId: message.id,
          ...input.llmData,
        })
        .run();

      return message;
    });
  },

  async getMessages(
    sourceType: MessageSourceType,
    sourceId: string,
    includeInactive = false,
  ): Promise<SelectMessage[]> {
    const db = getDatabase();

    const conditions = [
      eq(messagesTable.sourceType, sourceType),
      eq(messagesTable.sourceId, sourceId),
    ];

    if (!includeInactive) {
      conditions.push(eq(messagesTable.isActive, true));
    }

    return await db
      .select()
      .from(messagesTable)
      .where(and(...conditions))
      .orderBy(asc(messagesTable.createdAt));
  },

  async getDMMessages(
    dmId: string,
    includeInactive = false,
  ): Promise<SelectMessage[]> {
    return this.getMessages("dm", dmId, includeInactive);
  },

  async getChannelMessages(
    channelId: string,
    includeInactive = false,
  ): Promise<SelectMessage[]> {
    return this.getMessages("channel", channelId, includeInactive);
  },

  async getMessageWithLlmData(messageId: string, includeInactive = false) {
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
  },

  async findById(
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
  },

  async softDelete(id: string, deletedBy: string): Promise<void> {
    const db = getDatabase();

    await db.transaction((tx) => {
      const messageResults = tx
        .select()
        .from(messagesTable)
        .where(and(eq(messagesTable.id, id), eq(messagesTable.isActive, true)))
        .limit(1)
        .all();

      const [message] = messageResults;
      if (!message) {
        throw new Error("Message not found or already inactive");
      }

      tx.update(messagesTable)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(eq(messagesTable.id, id))
        .run();

      tx.update(llmMessagesTable)
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
        )
        .run();
    });
  },

  async restore(id: string): Promise<SelectMessage> {
    const db = getDatabase();

    return db.transaction((tx) => {
      const restoredResults = tx
        .update(messagesTable)
        .set({
          isActive: true,
          deactivatedAt: null,
          deactivatedBy: null,
          updatedAt: new Date(),
        })
        .where(and(eq(messagesTable.id, id), eq(messagesTable.isActive, false)))
        .returning()
        .all();

      const [restored] = restoredResults;
      if (!restored) {
        throw new Error("Message not found or not in soft deleted state");
      }

      tx.update(llmMessagesTable)
        .set({
          isActive: true,
          deactivatedAt: null,
          deactivatedBy: null,
          updatedAt: new Date(),
        })
        .where(eq(llmMessagesTable.messageId, id))
        .run();

      return restored;
    });
  },

  async update(id: string, content: string): Promise<SelectMessage> {
    const db = getDatabase();

    const [updated] = await db
      .update(messagesTable)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(and(eq(messagesTable.id, id), eq(messagesTable.isActive, true)))
      .returning();

    if (!updated) {
      throw new Error("Message not found, inactive, or update failed");
    }

    return updated;
  },

  async getMessageCount(
    sourceType: MessageSourceType,
    sourceId: string,
  ): Promise<number> {
    const db = getDatabase();

    const result = await db
      .select({ count: messagesTable.id })
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.sourceType, sourceType),
          eq(messagesTable.sourceId, sourceId),
          eq(messagesTable.isActive, true),
        ),
      );

    return result.length;
  },
};
