import { injectable } from "inversify";

import { Agent } from "@/core/domain/agent/agent.entity";
import { IAgentRepository } from "@/core/domain/agent/ports/agent-repository.interface";
import { AgentId } from "@/core/domain/agent/value-objects/agent-id.vo";
import { PersonaId } from "@/core/domain/agent/value-objects/persona/persona-id.vo";
import { NotFoundError } from "@/core/domain/common/errors";

@injectable()
export class InMemoryAgentRepository implements IAgentRepository {
  private readonly agents: Map<string, Agent> = new Map();

  async save(agent: Agent): Promise<Agent> {
    this.agents.set(agent.id.value, agent);
    return agent;
  }

  async findById(id: AgentId): Promise<Agent | null> {
    const agent = this.agents.get(id.value);
    return agent || null;
  }

  async findAll(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async delete(id: AgentId): Promise<void> {
    if (!this.agents.has(id.value)) {
      throw new NotFoundError("Agent", id.value);
    }
    this.agents.delete(id.value);
  }

  async findByPersonaId(personaId: PersonaId): Promise<Agent[]> {
    const foundAgents = Array.from(this.agents.values()).filter((agent) =>
      agent.personaTemplate.id.equals(personaId)
    );
    return foundAgents;
  }
}