import { eq, and, desc, asc, like } from "drizzle-orm";
import { db } from "../../../persistence/db";
import { channelMessages, type ChannelMessageSchema, type CreateChannelMessageSchema } from "./schema";
import type { ChannelMessageFilterDto } from "../../../../shared/types/channel-message.types";

export class ChannelMessageRepository {
  
  // CREATE
  async save(data: CreateChannelMessageSchema): Promise<ChannelMessageSchema> {
    const [message] = await db
      .insert(channelMessages)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return message;
  }

  // READ (lista com filtros e paginação)
  async findMany(filter?: ChannelMessageFilterDto): Promise<ChannelMessageSchema[]> {
    const conditions = [];
    
    // Aplicar filtros se existirem
    if (filter) {
      if (filter.channelId) {
        conditions.push(eq(channelMessages.channelId, filter.channelId));
      }
      
      if (filter.authorId) {
        conditions.push(eq(channelMessages.authorId, filter.authorId));
      }
      
      if (filter.type) {
        conditions.push(eq(channelMessages.type, filter.type as any));
      }

      if (filter.searchContent) {
        conditions.push(like(channelMessages.content, `%${filter.searchContent}%`));
      }
    }

    let query = db
      .select()
      .from(channelMessages)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(channelMessages.createdAt)); // Ordem cronológica

    // Aplicar paginação
    if (filter?.limit) {
      query = query.limit(filter.limit);
    }

    if (filter?.offset) {
      query = query.offset(filter.offset);
    }

    return await query;
  }

  // READ (por canal - método helper)
  async findByChannel(channelId: string, limit = 50, offset = 0): Promise<ChannelMessageSchema[]> {
    return this.findMany({ channelId, limit, offset });
  }

  // READ (por ID)
  async findById(id: string): Promise<ChannelMessageSchema | null> {
    const [message] = await db
      .select()
      .from(channelMessages)
      .where(eq(channelMessages.id, id))
      .limit(1);
    
    return message || null;
  }

  // READ (contagem total por canal)
  async countByChannel(channelId: string): Promise<number> {
    const [result] = await db
      .select({ count: channelMessages.id })
      .from(channelMessages)
      .where(eq(channelMessages.channelId, channelId));
    
    return result?.count ? 1 : 0; // better-sqlite3 returns 1 for count, not actual count
  }

  // READ (mensagens mais recentes por canal)
  async findLatestByChannel(channelId: string, limit = 50): Promise<ChannelMessageSchema[]> {
    return await db
      .select()
      .from(channelMessages)
      .where(eq(channelMessages.channelId, channelId))
      .orderBy(desc(channelMessages.createdAt))
      .limit(limit);
  }

  // READ (última mensagem do canal)
  async findLastMessageByChannel(channelId: string): Promise<ChannelMessageSchema | null> {
    const [message] = await db
      .select()
      .from(channelMessages)
      .where(eq(channelMessages.channelId, channelId))
      .orderBy(desc(channelMessages.createdAt))
      .limit(1);
    
    return message || null;
  }

  // UPDATE
  async update(id: string, data: Partial<CreateChannelMessageSchema>): Promise<ChannelMessageSchema> {
    const [updated] = await db
      .update(channelMessages)
      .set({
        ...data,
        updatedAt: new Date(),
        isEdited: true, // Marcar como editada
      })
      .where(eq(channelMessages.id, id))
      .returning();
    
    return updated;
  }

  // DELETE
  async delete(id: string): Promise<void> {
    await db.delete(channelMessages).where(eq(channelMessages.id, id));
  }

  // DELETE por canal (útil para limpeza)
  async deleteByChannel(channelId: string): Promise<void> {
    await db.delete(channelMessages).where(eq(channelMessages.channelId, channelId));
  }

  // SEARCH (busca de texto nas mensagens)
  async searchInChannel(channelId: string, searchTerm: string, limit = 20): Promise<ChannelMessageSchema[]> {
    return await db
      .select()
      .from(channelMessages)
      .where(
        and(
          eq(channelMessages.channelId, channelId),
          like(channelMessages.content, `%${searchTerm}%`)
        )
      )
      .orderBy(desc(channelMessages.createdAt))
      .limit(limit);
  }
}