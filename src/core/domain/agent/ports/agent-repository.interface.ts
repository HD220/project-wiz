// src/core/domain/agent/ports/agent-repository.interface.ts
import { Agent } from "../agent.entity";
import { AgentId } from "../value-objects/agent-id.vo";

export interface IAgentRepository {
  save(agent: Agent): Promise<Agent>;
  findById(id: AgentId): Promise<Agent | null>;
  findAll(): Promise<Agent[]>;
  delete(id: AgentId): Promise<void>;
}
