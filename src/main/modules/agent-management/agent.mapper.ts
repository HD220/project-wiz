import { Agent } from "./domain/agent.entity";
import type { AgentSchema } from "../../persistence/schemas/agents.schema";

export class AgentMapper {
  toDomain(schema: AgentSchema): Agent {
    return new Agent(
      schema.id,
      schema.name,
      schema.role,
      schema.goal,
      schema.backstory,
      schema.llmProviderId,
      schema.temperature,
      schema.maxTokens,
      schema.isActive,
      schema.isDefault || false,
      new Date(schema.createdAt),
      new Date(schema.updatedAt)
    );
  }

  toSchema(agent: Agent): Omit<AgentSchema, "id" | "createdAt" | "updatedAt"> {
    return {
      name: agent.name,
      role: agent.role,
      goal: agent.goal,
      backstory: agent.backstory,
      llmProviderId: agent.llmProviderId,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      isActive: agent.isActive,
      isDefault: agent.isDefault,
    };
  }
}