import { eq, and } from "drizzle-orm";
import { db } from "../../../persistence/db";
import { conversations } from "./schema";
import { ConversationData, CreateConversationData } from "../entities/conversation.schema";

export class ConversationRepository {
  async save(data: ConversationData): Promise<ConversationData> {
    const [inserted] = await db
      .insert(conversations)
      .values({
        id: data.id,
        userId1: data.userId1,
        userId2: data.userId2,
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

  async findById(id: string): Promise<ConversationData | null> {
    const [result] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
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

  async findByUsers(userId1: string, userId2: string): Promise<ConversationData | null> {
    const [result] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.userId1, userId1),
          eq(conversations.userId2, userId2)
        )
      )
      .limit(1);

    if (result) {
      return {
        ...result,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      };
    }

    const [result2] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.userId1, userId2),
          eq(conversations.userId2, userId1)
        )
      )
      .limit(1);

    if (!result2) {
      return null;
    }

    return {
      ...result2,
      createdAt: new Date(result2.createdAt),
      updatedAt: new Date(result2.updatedAt),
    };
  }

  async update(data: ConversationData): Promise<ConversationData> {
    const [updated] = await db
      .update(conversations)
      .set({
        updatedAt: data.updatedAt,
      })
      .where(eq(conversations.id, data.id))
      .returning();

    return {
      ...updated,
      createdAt: new Date(updated.createdAt),
      updatedAt: new Date(updated.updatedAt),
    };
  }

  async delete(id: string): Promise<void> {
    await db.delete(conversations).where(eq(conversations.id, id));
  }
}