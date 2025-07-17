import { Agent, AgentData } from "../agent.entity";

export type AgentWithData = Agent;

export function createAgentFromData(data: Record<string, unknown>): Agent {
  const agentData: AgentData = {
    id: data.id as string,
    name: data.name as string,
    role: data.role as string,
    goal: data.goal as string,
    backstory: data.backstory as string,
    llmProviderId: data.llmProviderId as string,
    temperature: data.temperature as number,
    maxTokens: data.maxTokens as number,
    status: data.status as "active" | "inactive" | "busy",
    createdAt: new Date(data.createdAt as string),
    updatedAt: new Date(data.updatedAt as string),
  };

  return new Agent(agentData);
}
