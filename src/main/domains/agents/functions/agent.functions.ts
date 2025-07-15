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

const logger = getLogger("agent.functions");

export async function createAgent(data: CreateAgentDto): Promise<Agent> {
  const db = getDatabase();

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

export async function findAgentById(id: string): Promise<Agent | null> {
  const db = getDatabase();

  const [agent] = await db.select().from(agents).where(eq(agents.id, id));

  return agent ? createAgentFromData(agent) : null;
}

export async function findAgentByName(name: string): Promise<Agent | null> {
  const db = getDatabase();

  const [agent] = await db.select().from(agents).where(eq(agents.name, name));

  return agent ? createAgentFromData(agent) : null;
}

export async function findAllAgents(filter?: AgentFilterDto): Promise<Agent[]> {
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
): Promise<Agent> {
  const db = getDatabase();

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

  const [deleted] = await db
    .delete(agents)
    .where(eq(agents.id, id))
    .returning();

  if (deleted) {
    await publishEvent(new AgentDeletedEvent(id));
  }

  logger.info("Agent deleted", { agentId: id });
}

function createAgentFromData(data: Record<string, unknown>): Agent {
  const identity = new AgentIdentity(
    new AgentName(data.name as string),
    new AgentRole(data.role as string),
  );

  const behavior = new AgentBehavior(
    new AgentGoal(data.goal as string),
    new AgentBackstory(data.backstory as string),
  );

  return new Agent(identity, behavior);
}
