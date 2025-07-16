import { Agent } from "../entities";
import {
  AgentIdentity,
  AgentBehavior,
  AgentName,
  AgentRole,
  AgentGoal,
  AgentBackstory,
} from "../value-objects";

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

export function createAgentFromData(data: Record<string, unknown>): AgentWithData {
  const identity = new AgentIdentity(
    new AgentName(data.name as string),
    new AgentRole(data.role as string),
  );

  const behavior = new AgentBehavior(
    new AgentGoal(data.goal as string),
    new AgentBackstory(data.backstory as string),
  );

  const agent = new Agent(identity, behavior);

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