import { eq, and, desc, ne } from "drizzle-orm";
import { db } from "../../../persistence/db";
import { channels, type ChannelSchema, type CreateChannelSchema } from "./schema";
import type { ChannelFilterDto } from "../../../../shared/types/channel.types";

export class ChannelRepository {
  
  // CREATE
  async save(data: CreateChannelSchema): Promise<ChannelSchema> {
    const [channel] = await db
      .insert(channels)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return channel;
  }

  // READ (lista com filtros)
  async findMany(filter?: ChannelFilterDto): Promise<ChannelSchema[]> {
    const conditions = [];
    
    // Aplicar filtros se existirem
    if (filter) {
      if (filter.projectId) {
        conditions.push(eq(channels.projectId, filter.projectId));
      }
      
      // Removed type and isArchived filters

      if (filter.isPrivate !== undefined) {
        conditions.push(eq(channels.isPrivate, filter.isPrivate));
      }
    }

    const query = db
      .select()
      .from(channels)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(channels.createdAt));

    return await query;
  }

  // READ (por ID)
  async findById(id: string): Promise<ChannelSchema | null> {
    const [channel] = await db
      .select()
      .from(channels)
      .where(eq(channels.id, id))
      .limit(1);
    
    return channel || null;
  }

  // READ (por projeto - método helper)
  async findByProject(projectId: string): Promise<ChannelSchema[]> {
    return this.findMany({ projectId, isArchived: false });
  }

  // UPDATE
  async update(id: string, data: Partial<CreateChannelSchema>): Promise<ChannelSchema> {
    const [updated] = await db
      .update(channels)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(channels.id, id))
      .returning();
    
    return updated;
  }

  // SOFT DELETE (arquivar) - simplified
  async archive(id: string): Promise<ChannelSchema> {
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel;
  }

  // HARD DELETE
  async delete(id: string): Promise<void> {
    await db.delete(channels).where(eq(channels.id, id));
  }

  // Verificar se nome existe no projeto
  async existsByNameInProject(name: string, projectId: string, excludeId?: string): Promise<boolean> {
    const conditions = [
      eq(channels.name, name.toLowerCase()),
      eq(channels.projectId, projectId),
    ];

    // Excluir um ID específico (para updates)
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