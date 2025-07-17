import type { Agent } from "../agent.entity";
import type { AgentDto } from "@/shared/types";

export function agentToDto(agent: Agent): AgentDto {
  const agentData = agent.toData();

  return {
    id: agent.getId(),
    name: agent.getName(),
    role: agent.getRole(),
    goal: agent.getGoal(),
    backstory: agent.getBackstory(),
    llmProviderId: agent.getLlmProviderId(),
    temperature: agent.getTemperature(),
    maxTokens: agent.getMaxTokens(),
    status: agent.getStatus(),
    isActive: agent.isActive(),
    isDefault: false, // deprecated field
    isExecuting: agent.isBusy(),
    createdAt: agentData.createdAt,
    updatedAt: agentData.updatedAt,
  };
}
