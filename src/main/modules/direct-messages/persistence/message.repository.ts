import { eq, desc } from "drizzle-orm";
import { db } from "../../../persistence/db";
import { messages } from "./schema";
import { MessageData } from "../entities/message.schema";

export class MessageRepository {
  async save(data: MessageData): Promise<MessageData> {
    const [inserted] = await db
      .insert(messages)
      .values({
        id: data.id,
        content: data.content,
        conversationId: data.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        type: data.type,
        isEdited: data.isEdited,
        isRead: data.isRead,
        metadata: data.metadata,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .returning();

    return {
      ...inserted,
      createdAt: new Date(inserted.createdAt),
      updatedAt: new Date(inserted.updatedAt),
    };
  }

  async findById(id: string): Promise<MessageData | null> {
    const [result] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .limit(1);

    if (!result) {
      return null;
    }

    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }

  async findByConversationId(
    conversationId: string,
    limit?: number,
    offset?: number
  ): Promise<MessageData[]> {
    let query = db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt));

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    if (offset !== undefined) {
      query = query.offset(offset);
    }

    const results = await query;
    return results.map((message) => ({
      ...message,
      createdAt: new Date(message.createdAt),
      updatedAt: new Date(message.updatedAt),
    }));
  }

  async update(data: MessageData): Promise<MessageData> {
    const [updated] = await db
      .update(messages)
      .set({
        content: data.content,
        isEdited: data.isEdited,
        isRead: data.isRead,
        updatedAt: data.updatedAt,
      })
      .where(eq(messages.id, data.id))
      .returning();

    return {
      ...updated,
      createdAt: new Date(updated.createdAt),
      updatedAt: new Date(updated.updatedAt),
    };
  }

  async delete(id: string): Promise<void> {
    await db.delete(messages).where(eq(messages.id, id));
  }
}