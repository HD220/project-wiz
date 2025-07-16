import { eq } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import { agents } from "../../../persistence/schemas";
import { findAgentById, updateAgent, AgentWithData, findAllAgents, createAgentFromData } from "./agent-crud.functions";

import type { AgentFilterDto } from "../../../../shared/types";

const logger = getLogger("agent.operations");

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

