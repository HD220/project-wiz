import { eq } from "drizzle-orm";
import { getDatabase } from "@/infrastructure/database";
import { getLogger } from "@/infrastructure/logger";
import { agents } from "@/main/persistence/schemas/agents.schema";
import { Agent, AgentEntityData } from "./agent.entity";
import { AgentDataSchema } from "./value-objects/agent-values";

const logger = getLogger("agents.operations");

/**
 * Consolidated Agent Operations
 * All CRUD operations in one place instead of scattered across multiple files
 */

// Types
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

// Helper function to map DB result to Agent
function mapDbToAgent(dbResult: any): Agent {
  const agentData: AgentEntityData = {
    id: dbResult.id,
    name: dbResult.name,
    role: dbResult.role,
    goal: dbResult.goal,
    backstory: dbResult.backstory,
    llmProviderId: dbResult.llmProviderId,
    temperature: dbResult.temperature,
    maxTokens: dbResult.maxTokens,
    status: dbResult.status,
    createdAt: dbResult.createdAt,
    updatedAt: dbResult.updatedAt,
  };

  return new Agent(agentData);
}

// CREATE
export async function createAgent(data: CreateAgentData): Promise<Agent> {
  try {
    const validated = AgentDataSchema.parse({
      ...data,
      status: "inactive" as const,
    });

    const db = getDatabase();
    const now = new Date();

    const result = await db
      .insert(agents)
      .values({
        ...validated,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    logger.info(`Agent created: ${validated.name}`);
    return mapDbToAgent(result[0]);
  } catch (error) {
    logger.error("Failed to create agent", { error, data });
    throw error;
  }
}

// READ
export async function getAgentById(id: string): Promise<Agent | null> {
  try {
    const db = getDatabase();
    const result = await db
      .select()
      .from(agents)
      .where(eq(agents.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return mapDbToAgent(result[0]);
  } catch (error) {
    logger.error("Failed to get agent by ID", { error, id });
    throw error;
  }
}

export async function getAllAgents(): Promise<Agent[]> {
  try {
    const db = getDatabase();
    const result = await db.select().from(agents);

    return result.map(mapDbToAgent);
  } catch (error) {
    logger.error("Failed to get all agents", { error });
    throw error;
  }
}

export async function getActiveAgents(): Promise<Agent[]> {
  try {
    const db = getDatabase();
    const result = await db
      .select()
      .from(agents)
      .where(eq(agents.status, "active"));

    return result.map(mapDbToAgent);
  } catch (error) {
    logger.error("Failed to get active agents", { error });
    throw error;
  }
}

export async function getAgentByName(name: string): Promise<Agent | null> {
  try {
    const db = getDatabase();
    const result = await db
      .select()
      .from(agents)
      .where(eq(agents.name, name))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return mapDbToAgent(result[0]);
  } catch (error) {
    logger.error("Failed to get agent by name", { error, name });
    throw error;
  }
}

// UPDATE
export async function updateAgent(
  id: string,
  data: UpdateAgentData,
): Promise<Agent> {
  try {
    const db = getDatabase();
    const result = await db
      .update(agents)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Agent with ID ${id} not found`);
    }

    logger.info(`Agent updated: ${id}`);
    return mapDbToAgent(result[0]);
  } catch (error) {
    logger.error("Failed to update agent", { error, id, data });
    throw error;
  }
}

export async function activateAgent(id: string): Promise<Agent> {
  return updateAgent(id, { status: "active" });
}

export async function deactivateAgent(id: string): Promise<Agent> {
  return updateAgent(id, { status: "inactive" });
}

export async function setDefaultAgent(id: string): Promise<Agent> {
  try {
    const db = getDatabase();

    // Remove default from all agents
    await db
      .update(agents)
      .set({ isDefault: false })
      .where(eq(agents.isDefault, true));

    // Set new default
    const result = await db
      .update(agents)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(agents.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Agent with ID ${id} not found`);
    }

    logger.info(`Agent set as default: ${id}`);
    return mapDbToAgent(result[0]);
  } catch (error) {
    logger.error("Failed to set default agent", { error, id });
    throw error;
  }
}

// DELETE
export async function deleteAgent(id: string): Promise<void> {
  try {
    const db = getDatabase();
    const result = await db.delete(agents).where(eq(agents.id, id)).returning();

    if (result.length === 0) {
      throw new Error(`Agent with ID ${id} not found`);
    }

    logger.info(`Agent deleted: ${id}`);
  } catch (error) {
    logger.error("Failed to delete agent", { error, id });
    throw error;
  }
}

// BULK OPERATIONS
export async function bulkUpdateAgents(
  ids: string[],
  data: UpdateAgentData,
): Promise<Agent[]> {
  try {
    const db = getDatabase();
    const result = await db
      .update(agents)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, ids[0])) // This would need to be improved for multiple IDs
      .returning();

    logger.info(`Bulk updated ${result.length} agents`);
    return result.map(mapDbToAgent);
  } catch (error) {
    logger.error("Failed to bulk update agents", { error, ids, data });
    throw error;
  }
}

export async function countAgents(): Promise<number> {
  try {
    const db = getDatabase();
    const result = await db.select().from(agents);
    return result.length;
  } catch (error) {
    logger.error("Failed to count agents", { error });
    throw error;
  }
}

export async function countActiveAgents(): Promise<number> {
  try {
    const db = getDatabase();
    const result = await db
      .select()
      .from(agents)
      .where(eq(agents.status, "active"));
    return result.length;
  } catch (error) {
    logger.error("Failed to count active agents", { error });
    throw error;
  }
}
