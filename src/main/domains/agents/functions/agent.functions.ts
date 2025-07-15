import { eq } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { publishEvent } from "../../../infrastructure/events";
import { getLogger } from "../../../infrastructure/logger";
import {
  AgentCreatedEvent,
  AgentUpdatedEvent,
  AgentDeletedEvent,
} from "../../../kernel/events";
import { agents } from "../../../persistence/schemas";
import { Agent } from "../entities";
import {
  AgentIdentity,
  AgentBehavior,
  AgentName,
  AgentRole,
  AgentGoal,
  AgentBackstory,
} from "../value-objects";

import type {
  CreateAgentDto,
  UpdateAgentDto,
  AgentFilterDto,
} from "../../../../shared/types/agent.types";

export type AgentWithData = Agent & {
  id: string;
  llmProviderId: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

const logger = getLogger("agent.functions");

export async function createAgent(
  data: CreateAgentDto,
): Promise<AgentWithData> {
  const db = getDatabase();

  // Check if agent already exists with this name
  const existingAgent = await findAgentByName(data.name);
  if (existingAgent) {
    throw new Error(`Agent with name '${data.name}' already exists`);
  }

  const agentData = {
    name: data.name,
    role: data.role,
    goal: data.goal,
    backstory: data.backstory,
    llmProviderId: data.llmProviderId,
    temperature: data.temperature ?? 0.7,
    maxTokens: data.maxTokens ?? 1000,
    isActive: data.isActive ?? true,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const [saved] = await db.insert(agents).values(agentData).returning();

  await publishEvent(
    new AgentCreatedEvent(saved.id, {
      id: saved.id,
      name: saved.name,
      role: saved.role,
      goal: saved.goal,
      backstory: saved.backstory,
      llmProviderId: saved.llmProviderId,
    }),
  );

  logger.info("Agent created", { agentId: saved.id, name: saved.name });

  return createAgentFromData(saved);
}

export async function findAgentById(id: string): Promise<AgentWithData | null> {
  const db = getDatabase();

  const [agent] = await db.select().from(agents).where(eq(agents.id, id));

  return agent ? createAgentFromData(agent) : null;
}

export async function findAgentByName(
  name: string,
): Promise<AgentWithData | null> {
  const db = getDatabase();

  const [agent] = await db.select().from(agents).where(eq(agents.name, name));

  return agent ? createAgentFromData(agent) : null;
}

export async function findAllAgents(
  filter?: AgentFilterDto,
): Promise<AgentWithData[]> {
  const db = getDatabase();

  const query = db.select().from(agents);

  if (filter?.isActive !== undefined) {
    query.where(eq(agents.isActive, filter.isActive));
  }

  const results = await query;

  return results.map(createAgentFromData);
}

export async function updateAgent(
  id: string,
  data: UpdateAgentDto,
): Promise<AgentWithData> {
  const db = getDatabase();

  const existing = await findAgentById(id);
  if (!existing) {
    throw new Error(`Agent with id '${id}' not found`);
  }

  // If name is being updated, check for conflicts
  if (data.name) {
    const existingByName = await findAgentByName(data.name);
    if (existingByName && existingByName.getName() !== existing.getName()) {
      throw new Error(`Agent with name '${data.name}' already exists`);
    }
  }

  const updateData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const [updated] = await db
    .update(agents)
    .set(updateData)
    .where(eq(agents.id, id))
    .returning();

  await publishEvent(new AgentUpdatedEvent(id, { ...data }));

  logger.info("Agent updated", { agentId: id });

  return createAgentFromData(updated);
}

export async function deleteAgent(id: string): Promise<void> {
  const db = getDatabase();

  const existing = await findAgentById(id);
  if (!existing) {
    throw new Error(`Agent with id '${id}' not found`);
  }

  const [deleted] = await db
    .delete(agents)
    .where(eq(agents.id, id))
    .returning();

  if (deleted) {
    await publishEvent(new AgentDeletedEvent(id));
  }

  logger.info("Agent deleted", { agentId: id });
}

export async function findActiveAgents(): Promise<AgentWithData[]> {
  return findAllAgents({ isActive: true });
}

export async function activateAgent(id: string): Promise<AgentWithData> {
  return updateAgent(id, { isActive: true });
}

export async function deactivateAgent(id: string): Promise<AgentWithData> {
  return updateAgent(id, { isActive: false });
}

export async function setDefaultAgent(id: string): Promise<void> {
  const db = getDatabase();

  await db.transaction(async (tx) => {
    await tx.update(agents).set({ isDefault: false });
    await tx.update(agents).set({ isDefault: true }).where(eq(agents.id, id));
  });

  logger.info("Default agent set", { agentId: id });
}

export async function findDefaultAgent(): Promise<AgentWithData | null> {
  const db = getDatabase();

  const [agent] = await db
    .select()
    .from(agents)
    .where(eq(agents.isDefault, true));

  return agent ? createAgentFromData(agent) : null;
}

export async function findAgentsByLlmProvider(
  llmProviderId: string,
): Promise<AgentWithData[]> {
  const db = getDatabase();

  const results = await db
    .select()
    .from(agents)
    .where(eq(agents.llmProviderId, llmProviderId));

  return results.map(createAgentFromData);
}

function createAgentFromData(data: Record<string, unknown>): AgentWithData {
  const identity = new AgentIdentity(
    new AgentName(data.name as string),
    new AgentRole(data.role as string),
  );

  const behavior = new AgentBehavior(
    new AgentGoal(data.goal as string),
    new AgentBackstory(data.backstory as string),
  );

  const agent = new Agent(identity, behavior);

  // Extend the agent with database fields
  return Object.assign(agent, {
    id: data.id as string,
    llmProviderId: data.llmProviderId as string,
    temperature: data.temperature as number,
    maxTokens: data.maxTokens as number,
    isActive: data.isActive as boolean,
    isDefault: data.isDefault as boolean,
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string,
  });
}
