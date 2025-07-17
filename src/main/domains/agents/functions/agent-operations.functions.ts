import { eq } from "drizzle-orm";
import { getDatabase } from "../../../infrastructure/database";
import { agents } from "../../../persistence/schemas/agents.schema";
import { Agent } from "../agent.entity";
import { findAgentById } from "./agent-crud.functions";
import { createAgentFromDbData } from "./agent.mapper";

export async function activateAgent(id: string): Promise<Agent> {
  const agent = await findAgentOrThrow(id);
  const activatedAgent = agent.activate();
  return await updateAgentData(activatedAgent);
}

export async function deactivateAgent(id: string): Promise<Agent> {
  const agent = await findAgentOrThrow(id);
  const deactivatedAgent = agent.deactivate();
  return await updateAgentData(deactivatedAgent);
}

async function findAgentOrThrow(id: string): Promise<Agent> {
  const agent = await findAgentById(id);
  if (!agent) {
    throw new Error(`Agent not found: ${id}`);
  }
  return agent;
}

async function updateAgentData(agent: Agent): Promise<Agent> {
  const db = getDatabase();
  const data = agent.toData();

  const dbData = {
    id: data.id,
    name: data.name,
    role: data.role,
    goal: data.goal,
    backstory: data.backstory,
    llmProviderId: data.llmProviderId,
    temperature: data.temperature,
    maxTokens: data.maxTokens,
    isActive: data.status === "active",
    isDefault: false,
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
  };

  const result = await db
    .update(agents)
    .set(dbData)
    .where(eq(agents.id, data.id))
    .returning();

  if (!result[0]) {
    throw new Error("Failed to update agent - no result returned");
  }

  return createAgentFromDbData(result[0]);
}
