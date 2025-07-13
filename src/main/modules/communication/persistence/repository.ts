import { eq, and, desc, ne } from "drizzle-orm";
import { db } from "../../../persistence/db";
import { channels, type ChannelSchema } from "./schema";
import type { ChannelFilterDto } from "../../../../shared/types/channel.types";
import { ChannelData } from "../entities/channel.schema";

export class ChannelRepository {
  async save(data: ChannelData): Promise<ChannelData> {
    const [channel] = await db
      .insert(channels)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return {
        ...channel,
        createdAt: new Date(channel.createdAt),
        updatedAt: new Date(channel.updatedAt),
    };
  }

  async findMany(filter?: ChannelFilterDto): Promise<ChannelData[]> {
    const conditions = [];
    
    if (filter) {
      if (filter.projectId) {
        conditions.push(eq(channels.projectId, filter.projectId));
      }
      
      if (filter.type) {
        conditions.push(eq(channels.type, filter.type));
      }
      
      if (filter.isArchived !== undefined) {
        conditions.push(eq(channels.isArchived, filter.isArchived));
      }

      if (filter.isPrivate !== undefined) {
        conditions.push(eq(channels.isPrivate, filter.isPrivate));
      }
    }

    const query = db
      .select()
      .from(channels)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(channels.createdAt));

    const results = await query;

    return results.map((channel) => ({
        ...channel,
        createdAt: new Date(channel.createdAt),
        updatedAt: new Date(channel.updatedAt),
    }));
  }

  async findById(id: string): Promise<ChannelData | null> {
    const [channel] = await db
      .select()
      .from(channels)
      .where(eq(channels.id, id))
      .limit(1);
    
    if (!channel) {
        return null;
    }

    return {
        ...channel,
        createdAt: new Date(channel.createdAt),
        updatedAt: new Date(channel.updatedAt),
    };
  }

  async update(data: ChannelData): Promise<ChannelData> {
    const [updated] = await db
      .update(channels)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(channels.id, data.id))
      .returning();
    
    return {
        ...updated,
        createdAt: new Date(updated.createdAt),
        updatedAt: new Date(updated.updatedAt),
    };
  }

  async delete(id: string): Promise<void> {
    await db.delete(channels).where(eq(channels.id, id));
  }

  async existsByNameInProject(name: string, projectId: string, excludeId?: string): Promise<boolean> {
    const conditions = [
      eq(channels.name, name.toLowerCase()),
      eq(channels.projectId, projectId),
      eq(channels.isArchived, false)
    ];

    if (excludeId) {
      conditions.push(ne(channels.id, excludeId));
    }

    const [existing] = await db
      .select({ id: channels.id })
      .from(channels)
      .where(and(...conditions))
      .limit(1);
      
    return !!existing;
  }
}