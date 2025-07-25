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

    console.log("📚 MESSAGE SERVICE GET - Retrieved:", {
      "Conversation ID": conversationId,
      "Messages count": result.length,
      "Sample message": result[0]
        ? {
            id: result[0].id,
            createdAt: result[0].createdAt,
            "createdAt type": typeof result[0].createdAt,
            "createdAt as Date": new Date(result[0].createdAt),
            "createdAt toString": new Date(result[0].createdAt).toString(),
          }
        : "No messages",
    });

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
