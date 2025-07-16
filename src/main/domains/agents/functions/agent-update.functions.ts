import { eq } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { publishEvent } from "../../../infrastructure/events";
import { getLogger } from "../../../infrastructure/logger";
import { AgentUpdatedEvent, AgentDeletedEvent } from "../../../kernel/events";
import { agents } from "../../../persistence/schemas";
import { createAgentFromData, AgentWithData } from "./agent-factory.functions";
import { findAgentById, findAgentByName } from "./agent-query.functions";

import type { UpdateAgentDto } from "../../../../shared/types";

const logger = getLogger("agent.update");

export async function updateAgent(
  id: string,
  data: UpdateAgentDto,
): Promise<AgentWithData> {
  await validateAgentUpdate(id, data);

  const updateData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const db = getDatabase();
  const [updated] = await db
    .update(agents)
    .set(updateData)
    .where(eq(agents.id, id))
    .returning();

  await publishEvent(new AgentUpdatedEvent(id, { ...data }));
  logger.info("Agent updated", { agentId: id });
  return createAgentFromData(updated);
}

async function validateAgentUpdate(id: string, data: UpdateAgentDto) {
  const existing = await findAgentById(id);
  if (!existing) {
    throw new Error(`Agent with id '${id}' not found`);
  }

  if (data.name) {
    const existingByName = await findAgentByName(data.name);
    if (existingByName && existingByName.getName() !== existing.getName()) {
      throw new Error(`Agent with name '${data.name}' already exists`);
    }
  }
}

export async function deleteAgent(id: string): Promise<void> {
  const existing = await findAgentById(id);
  if (!existing) {
    throw new Error(`Agent with id '${id}' not found`);
  }

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