import { Agent, type AgentData } from "../agent.entity";
import type { AgentDto } from "@/shared/types";
import { AgentSchema } from "../../../persistence/schemas/agents.schema";

export function agentToDto(agent: Agent): AgentDto {
  const agentData = agent.toData();

  return {
    id: agentData.id,
    name: agentData.name,
    role: agentData.role,
    goal: agentData.goal,
    backstory: agentData.backstory,
    llmProviderId: agentData.llmProviderId,
    temperature: agentData.temperature,
    maxTokens: agentData.maxTokens,
    status: agentData.status,
    isActive: agent.isActive(),
    isDefault: false, // deprecated field
    isExecuting: agent.isBusy(),
    createdAt: agentData.createdAt,
    updatedAt: agentData.updatedAt,
  };
}

export function dbToAgentData(dbData: AgentSchema): AgentData {
  return {
    id: dbData.id,
    name: dbData.name,
    role: dbData.role,
    goal: dbData.goal,
    backstory: dbData.backstory,
    llmProviderId: dbData.llmProviderId,
    temperature: dbData.temperature,
    maxTokens: dbData.maxTokens,
    status: dbData.isActive ? "active" : "inactive",
    createdAt: new Date(dbData.createdAt),
    updatedAt: new Date(dbData.updatedAt),
  };
}

export function createAgentFromDbData(dbData: AgentSchema): Agent {
  return new Agent(dbToAgentData(dbData));
}
