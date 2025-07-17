import { eq } from "drizzle-orm";
import { getDatabase } from "../../infrastructure/database";
import { getLogger } from "../../infrastructure/logger";
import { agents } from "../../persistence/schemas/agents.schema";
import { Agent } from "./agent.entity";
import { createAgentFromDbData } from "./functions/agent.mapper";
import { AgentDataSchema } from "./value-objects/agent-values";

const logger = getLogger("agents.repository");

export type CreateAgentData = {
  name: string;
  role: string;
  goal: string;
  backstory: string;
  llmProviderId: string;
  temperature?: number;
  maxTokens?: number;
};

export type UpdateAgentData = {
  name?: string;
  role?: string;
  goal?: string;
  backstory?: string;
  llmProviderId?: string;
  temperature?: number;
  maxTokens?: number;
  status?: "active" | "inactive" | "busy";
};

export class AgentsRepository {
  private db = getDatabase();

  async create(data: CreateAgentData): Promise<Agent> {
    const validated = AgentDataSchema.parse({
      ...data,
      status: "inactive" as const,
    });

    const result = await this.db
      .insert(agents)
      .values({
        name: validated.name,
        role: validated.role,
        goal: validated.goal,
        backstory: validated.backstory,
        llmProviderId: validated.llmProviderId,
        temperature: validated.temperature,
        maxTokens: validated.maxTokens,
        isActive: false,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    logger.info(`Agent created: ${validated.name}`);
    if (!result[0]) {
      throw new Error("Failed to create agent");
    }
    return createAgentFromDbData(result[0]);
  }

  async findById(id: string): Promise<Agent | null> {
    const result = await this.db
      .select()
      .from(agents)
      .where(eq(agents.id, id))
      .limit(1);

    return result.length > 0 && result[0]
      ? createAgentFromDbData(result[0])
      : null;
  }

  async findAll(): Promise<Agent[]> {
    const result = await this.db.select().from(agents);
    return result.map(createAgentFromDbData);
  }

  async findActive(): Promise<Agent[]> {
    const result = await this.db
      .select()
      .from(agents)
      .where(eq(agents.isActive, true));

    return result.map(createAgentFromDbData);
  }

  async update(id: string, data: UpdateAgentData): Promise<Agent> {
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (data.name) updateData.name = data.name;
    if (data.role) updateData.role = data.role;
    if (data.goal) updateData.goal = data.goal;
    if (data.backstory) updateData.backstory = data.backstory;
    if (data.llmProviderId) updateData.llmProviderId = data.llmProviderId;
    if (data.temperature !== undefined)
      updateData.temperature = data.temperature;
    if (data.maxTokens !== undefined) updateData.maxTokens = data.maxTokens;
    if (data.status !== undefined)
      updateData.isActive = data.status === "active";

    const result = await this.db
      .update(agents)
      .set(updateData)
      .where(eq(agents.id, id))
      .returning();

    if (result.length === 0 || !result[0]) {
      throw new Error(`Agent not found: ${id}`);
    }

    logger.info(`Agent updated: ${id}`);
    return createAgentFromDbData(result[0]);
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .delete(agents)
      .where(eq(agents.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Agent not found: ${id}`);
    }

    logger.info(`Agent deleted: ${id}`);
  }

  async count(): Promise<number> {
    const result = await this.db.select().from(agents);
    return result.length;
  }

  async countActive(): Promise<number> {
    const result = await this.db
      .select()
      .from(agents)
      .where(eq(agents.isActive, true));
    return result.length;
  }
}
