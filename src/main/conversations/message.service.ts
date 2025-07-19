import { eq, asc } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";

import { messagesTable, llmMessagesTable } from "./messages.schema";

import type {
  SelectMessage,
  InsertMessage,
  InsertLlmMessage,
} from "./messages.schema";

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
  static async send(input: SendMessageInput): Promise<SelectMessage> {
    const db = getDatabase();

    const [message] = await db.insert(messagesTable).values(input).returning();

    if (!message) {
      throw new Error("Failed to send message");
    }

    return message;
  }

  static async sendWithLlmData(
    input: SendLlmMessageInput,
  ): Promise<SelectMessage> {
    const db = getDatabase();

    // Inserir mensagem principal
    const [message] = await db
      .insert(messagesTable)
      .values(input.messageInput)
      .returning();

    if (!message) {
      throw new Error("Failed to send message");
    }

    // Inserir dados LLM associados
    await db.insert(llmMessagesTable).values({
      messageId: message.id,
      ...input.llmData,
    });

    return message;
  }

  static async getConversationMessages(
    conversationId: string,
  ): Promise<SelectMessage[]> {
    const db = getDatabase();

    return await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(asc(messagesTable.createdAt));
  }

  static async getMessageWithLlmData(messageId: string) {
    const db = getDatabase();

    const [result] = await db
      .select({
        message: messagesTable,
        llmMessage: llmMessagesTable,
      })
      .from(messagesTable)
      .leftJoin(
        llmMessagesTable,
        eq(messagesTable.id, llmMessagesTable.messageId),
      )
      .where(eq(messagesTable.id, messageId))
      .limit(1);

    return result;
  }
}
