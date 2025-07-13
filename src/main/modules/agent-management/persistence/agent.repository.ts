import { eq, and, desc, like } from "drizzle-orm";
import { db } from "../../../persistence/db";
import { agentSchema, type AgentSchema, type CreateAgentSchema } from "./schema";

export interface AgentFilterDto {
  name?: string;
  role?: string;
  llmProviderId?: string;
  isActive?: boolean;
}

export class AgentRepository {
  async save(data: CreateAgentSchema): Promise<AgentSchema> {
    const [saved] = await db
      .insert(agentSchema)
      .values({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return saved;
  }

  async findById(id: string): Promise<AgentSchema | null> {
    const [result] = await db
      .select()
      .from(agentSchema)
      .where(eq(agentSchema.id, id))
      .limit(1);

    return result || null;
  }

  async findByName(name: string): Promise<AgentSchema | null> {
    const [result] = await db
      .select()
      .from(agentSchema)
      .where(eq(agentSchema.name, name))
      .limit(1);

    return result || null;
  }

  async findMany(filter?: AgentFilterDto): Promise<AgentSchema[]> {
    const conditions = [];

    if (filter?.name) {
      conditions.push(like(agentSchema.name, `%${filter.name}%`));
    }

    if (filter?.role) {
      conditions.push(like(agentSchema.role, `%${filter.role}%`));
    }

    if (filter?.llmProviderId) {
      conditions.push(eq(agentSchema.llmProviderId, filter.llmProviderId));
    }

    if (filter?.isActive !== undefined) {
      conditions.push(eq(agentSchema.isActive, filter.isActive));
    }

    let query = db.select().from(agentSchema);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(desc(agentSchema.createdAt));

    return await query;
  }

  async findActiveAgents(): Promise<AgentSchema[]> {
    return this.findMany({ isActive: true });
  }

  async update(id: string, data: Partial<CreateAgentSchema>): Promise<AgentSchema> {
    const [updated] = await db
      .update(agentSchema)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(agentSchema.id, id))
      .returning();

    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.delete(agentSchema).where(eq(agentSchema.id, id));
  }

  async existsByName(name: string): Promise<boolean> {
    const [result] = await db
      .select({ count: agentSchema.id })
      .from(agentSchema)
      .where(eq(agentSchema.name, name))
      .limit(1);

    return !!result;
  }
}