
import { conversations, messages } from "../db/schema";
import { eq, like, and, asc, desc } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { v4 as uuidv4 } from "uuid";

/**
 * Tipos inferidos das tabelas
 */
type Conversation = typeof conversations.$inferSelect;
type NewConversation = typeof conversations.$inferInsert;
type Message = typeof messages.$inferSelect;
type NewMessage = typeof messages.$inferInsert;

/**
 * Interface do serviço de histórico
 */
export interface HistoryService {
  createConversation(title?: string): Promise<Conversation>;
  addMessage(conversationId: string, role: "user" | "assistant", content: string): Promise<Message>;
  getConversations(params?: { offset?: number; limit?: number; search?: string }): Promise<Conversation[]>;
  getMessages(conversationId: string): Promise<Message[]>;
  deleteConversation(conversationId: string): Promise<void>;
  exportHistory(format: "json" | "csv"): Promise<Blob | string>;
  renameConversation(conversationId: string, newTitle: string): Promise<void>;
}

/**
 * Implementação do serviço de histórico
 */
export class HistoryServiceImpl implements HistoryService {
  constructor(private db: BetterSQLite3Database<any>){}

  async createConversation(title?: string): Promise<Conversation> {
    const now = new Date();
    const conversation: NewConversation = {
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      title: title ?? null,
    };
    this.db.insert(conversations).values(conversation).run();
    return conversation as Conversation;
  }

  async addMessage(conversationId: string, role: "user" | "assistant", content: string): Promise<Message> {
    const message: NewMessage = {
      id: uuidv4(),
      conversationId,
      role,
      content,
      timestamp: new Date(),
    };
    this.db.insert(messages).values(message).run();
    return message as Message;
  }

  async getConversations(params?: { offset?: number; limit?: number; search?: string }): Promise<Conversation[]> {
    const whereClauses = [];
    if (params?.search) {
      whereClauses.push(like(conversations.title, `%${params.search}%`));
    }

    const baseQuery = this.db.select().from(conversations);

    const filteredQuery = whereClauses.length > 0
      ? baseQuery.where(and(...whereClauses))
      : baseQuery;

    const orderedQuery = filteredQuery.orderBy(desc(conversations.updatedAt));

    const limitedQuery = params?.limit !== undefined
      ? orderedQuery.limit(params.limit)
      : orderedQuery;

    const offsetQuery = params?.offset !== undefined
      ? limitedQuery.offset(params.offset)
      : limitedQuery;

    return await offsetQuery.all();
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return await this.db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.timestamp))
      .all();
  }

  async deleteConversation(conversationId: string): Promise<void> {
    this.db.delete(messages).where(eq(messages.conversationId, conversationId)).run();
    this.db.delete(conversations).where(eq(conversations.id, conversationId)).run();
  }

  async exportHistory(format: "json" | "csv"): Promise<Blob | string> {
    const allConversations = this.db.select().from(conversations).all();
    const allMessages = this.db.select().from(messages).all();

    if (format === "json") {
      const data = { conversations: allConversations, messages: allMessages };
      return JSON.stringify(data, null, 2);
    } else if (format === "csv") {
      const convCsv = ["id,createdAt,updatedAt,title"];
      for (const conv of allConversations) {
        convCsv.push(
          `${conv.id},${conv.createdAt.toISOString()},${conv.updatedAt.toISOString()},"${conv.title ?? ""}"`
        );
      }
      const msgCsv = ["id,conversationId,role,content,timestamp"];
      for (const msg of allMessages) {
        msgCsv.push(
          `${msg.id},${msg.conversationId},${msg.role},"${msg.content.replace(/\"/g, '""')}",${msg.timestamp.toISOString()}`
        );
      }
      return convCsv.join("\n") + "\n\n" + msgCsv.join("\n");
    }
    throw new Error("Formato de exportação não suportado");
  }

  async renameConversation(conversationId: string, newTitle: string): Promise<void> {
    await this.db
      .update(conversations)
      .set({ title: newTitle, updatedAt: new Date() })
      .where(eq(conversations.id, conversationId))
      .run();
  }
}

