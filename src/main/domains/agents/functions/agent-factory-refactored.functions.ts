import { Agent } from "../agent.entity";
import { AgentIdentity } from "../value-objects/agent-identity.vo";
import { AgentConfiguration } from "../value-objects/agent-configuration.vo";
import { AgentRuntime } from "../value-objects/agent-runtime.vo";

import { getLogger } from "@/infrastructure/logger";
import { publishEvent } from "@/infrastructure/events";

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
  const logger = getLogger("createAgent");

  try {
    const identity = new AgentIdentity(props.id || crypto.randomUUID());

    const configuration = new AgentConfiguration({
      name: props.name,
      role: props.role,
      goal: props.goal,
      backstory: props.backstory,
      llmProviderId: props.llmProviderId,
      temperature: props.temperature || 0.7,
      maxTokens: props.maxTokens || 1000,
      status: props.status || "inactive",
    });

    const runtime = new AgentRuntime({
      status: props.status || "inactive",
      queueSize: 0,
      isProcessing: false,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const agent = new Agent(identity, configuration, runtime);

    publishEvent("agent.created", {
      agentId: identity.getValue(),
      agentName: props.name,
      timestamp: new Date(),
    });

    logger.info("Agent created successfully", {
      id: identity.getValue(),
      name: props.name,
      role: props.role,
    });

    return agent;
  } catch (error) {
    logger.error("Failed to create agent", {
      error,
      props,
    });
    throw new Error("Failed to create agent");
  }
}

export function createAgentFromData(data: any): Agent {
  const identity = new AgentIdentity(data.id);

  const configuration = new AgentConfiguration({
    name: data.name,
    role: data.role,
    goal: data.goal,
    backstory: data.backstory,
    llmProviderId: data.llmProviderId,
    temperature: data.temperature,
    maxTokens: data.maxTokens,
    status: data.status,
  });

  const runtime = new AgentRuntime({
    status: data.status,
    queueSize: data.queueSize || 0,
    isProcessing: data.isProcessing || false,
    lastActivity: data.lastActivity || new Date(),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  });

  return new Agent(identity, configuration, runtime);
}

export type AgentWithData = Agent;
