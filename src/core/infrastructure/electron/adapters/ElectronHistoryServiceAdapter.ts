import { dbPromise } from "../db-client";
import { conversations, messages } from "../../db/schema";
import { eq, like, and, asc, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import type { HistoryRepositoryPort, Conversation, Message } from "../../../application/ports/HistoryRepositoryPort";

export class ElectronHistoryServiceAdapter implements HistoryRepositoryPort {
  async getAllConversations(): Promise<Conversation[]> {
    const db = await dbPromise;
    const result = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.updatedAt))
      .all();

    return result as Conversation[];
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    const db = await dbPromise;
    const result = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .get();

    return result ? (result as Conversation) : null;
  }

  async createConversation(title?: string): Promise<Conversation> {
    const db = await dbPromise;
    const now = new Date();
    const conversation = {
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      title: title ?? null,
    };
    await db.insert(conversations).values(conversation).run();
    return conversation as Conversation;
  }

  async updateConversationTitle(id: string, newTitle: string): Promise<void> {
    const db = await dbPromise;
    await db
      .update(conversations)
      .set({ title: newTitle, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .run();
  }

  async deleteConversation(id: string): Promise<void> {
    const db = await dbPromise;
    await db.delete(messages).where(eq(messages.conversationId, id)).run();
    await db.delete(conversations).where(eq(conversations.id, id)).run();
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const db = await dbPromise;
    const rows = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.timestamp))
      .all();

    return rows.map((row) => ({
      id: row.id,
      conversationId: row.conversationId,
      role: row.role as 'user' | 'assistant',
      content: row.content,
      createdAt: row.timestamp,
    }));
  }

  async addMessage(conversationId: string, message: Message): Promise<void> {
    const db = await dbPromise;
    const newMessage = {
      id: message.id ?? uuidv4(),
      conversationId,
      role: message.role,
      content: message.content,
      timestamp: message.createdAt ?? new Date(),
    };
    await db.insert(messages).values(newMessage).run();
  }

  async deleteMessage(messageId: string): Promise<void> {
    const db = await dbPromise;
    await db.delete(messages).where(eq(messages.id, messageId)).run();
  }
}