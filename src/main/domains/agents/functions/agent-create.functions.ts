import { getDatabase } from "../../../infrastructure/database";
import { publishEvent } from "../../../infrastructure/events";
import { getLogger } from "../../../infrastructure/logger";
import { AgentCreatedEvent } from "../../../kernel/events";
import { agents } from "../../../persistence/schemas";
import { createAgentFromData, AgentWithData } from "./agent-factory.functions";
import { findAgentByName } from "./agent-query.functions";

import type { CreateAgentDto } from "../../../../shared/types";

const logger = getLogger("agent.create");

export async function createAgent(
  data: CreateAgentDto,
): Promise<AgentWithData> {
  const existingAgent = await findAgentByName(data.name);
  if (existingAgent) {
    throw new Error(`Agent with name '${data.name}' already exists`);
  }

  const agent = buildAgentData(data);
  return saveNewAgent(agent);
}

function buildAgentData(data: CreateAgentDto) {
  return {
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
}

async function saveNewAgent(agentData: any): Promise<AgentWithData> {
  const db = getDatabase();
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