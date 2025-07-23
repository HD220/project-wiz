import { eq, asc } from "drizzle-orm";

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

    const result = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(asc(messagesTable.createdAt));

    // console.log(result);

    // const parsed = result.map((row) => ({
    //   id: row.id,
    //   conversationId: row.conversationId,
    //   authorId: row.authorId,
    //   content: row.content,
    //   createdAt: new Date(row.createdAt as unknown as number),
    //   updatedAt: new Date(row.updatedAt as unknown as number),
    // }));

    // console.log("Parsed messages:", parsed);

    return result;
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
