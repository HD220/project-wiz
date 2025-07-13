import { eq, and, desc, asc, like } from "drizzle-orm";
import { db } from "../../../persistence/db";
import { channelMessages } from "./schema";
import { ChannelMessageData } from "../entities/channel-message.schema";
import type { ChannelMessageFilterDto } from "../../../../shared/types/channel-message.types";

export class ChannelMessageRepository {
  async save(data: ChannelMessageData): Promise<ChannelMessageData> {
    const [inserted] = await db
      .insert(channelMessages)
      .values({
        id: data.id,
        content: data.content,
        channelId: data.channelId,
        authorId: data.authorId,
        authorName: data.authorName,
        type: data.type,
        isEdited: data.isEdited,
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

  async findMany(filter?: ChannelMessageFilterDto): Promise<ChannelMessageData[]> {
    const conditions = [];

    if (filter) {
      if (filter.channelId) {
        conditions.push(eq(channelMessages.channelId, filter.channelId));
      }
      if (filter.authorId) {
        conditions.push(eq(channelMessages.authorId, filter.authorId));
      }
      if (filter.type) {
        conditions.push(eq(channelMessages.type, filter.type));
      }
      if (filter.searchContent) {
        conditions.push(like(channelMessages.content, `%${filter.searchContent}%`));
      }
    }

    let query = db
      .select()
      .from(channelMessages)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(channelMessages.createdAt));

    if (filter?.limit) {
      query = query.limit(filter.limit);
    }

    if (filter?.offset) {
      query = query.offset(filter.offset);
    }

    const results = await query;

    return results.map((message) => ({
      ...message,
      createdAt: new Date(message.createdAt),
      updatedAt: new Date(message.updatedAt),
    }));
  }

  async findById(id: string): Promise<ChannelMessageData | null> {
    const [result] = await db
      .select()
      .from(channelMessages)
      .where(eq(channelMessages.id, id))
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

  async update(data: ChannelMessageData): Promise<ChannelMessageData> {
    const [updated] = await db
      .update(channelMessages)
      .set({
        content: data.content,
        isEdited: data.isEdited,
        updatedAt: data.updatedAt,
      })
      .where(eq(channelMessages.id, data.id))
      .returning();

    return {
      ...updated,
      createdAt: new Date(updated.createdAt),
      updatedAt: new Date(updated.updatedAt),
    };
  }

  async delete(id: string): Promise<void> {
    await db.delete(channelMessages).where(eq(channelMessages.id, id));
  }
}