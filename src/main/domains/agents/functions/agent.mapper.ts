import type { AgentWithData } from "./agent-factory.functions";
import type { AgentDto } from "@/shared/types";

export function agentToDto(agent: AgentWithData): AgentDto {
  return {
    id: agent.id,
    name: agent.getName(),
    role: agent.getRole(),
    goal: agent.getBehavior().getGoal().getValue(),
    backstory: agent.getBehavior().getBackstory().getValue(),
    llmProviderId: agent.llmProviderId,
    temperature: agent.temperature,
    maxTokens: agent.maxTokens,
    isActive: agent.isActive,
    isDefault: agent.isDefault,
    createdAt: new Date(agent.createdAt),
    updatedAt: new Date(agent.updatedAt),
  };
}
