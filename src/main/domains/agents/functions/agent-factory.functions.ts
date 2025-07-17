import { Agent, AgentData } from "../agent.entity";
import { getLogger } from "@/infrastructure/logger";
import { publishEvent } from "@/infrastructure/events";

const logger = getLogger("agent-factory");

export type AgentWithData = Agent;

interface CreateAgentProps {
  id?: string;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  llmProviderId: string;
  temperature?: number;
  maxTokens?: number;
  status?: "active" | "inactive" | "busy";
}

export function createAgent(props: CreateAgentProps): Agent {
  try {
    const agentData: AgentData = {
      id: props.id || crypto.randomUUID(),
      name: props.name,
      role: props.role,
      goal: props.goal,
      backstory: props.backstory,
      llmProviderId: props.llmProviderId,
      temperature: props.temperature || 0.7,
      maxTokens: props.maxTokens || 1000,
      status: props.status || "inactive",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const agent = new Agent(agentData);

    publishEvent({
      type: "agent.created",
      agentId: agentData.id,
      agentName: agentData.name,
      timestamp: new Date(),
    });

    logger.info("Agent created successfully", {
      id: agentData.id,
      name: agentData.name,
      role: agentData.role,
    });

    return agent;
  } catch (error) {
    logger.error("Failed to create agent", { error, props });
    throw new Error("Failed to create agent");
  }
}

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
