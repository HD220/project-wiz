// src_refactored/infrastructure/persistence/in-memory/repositories/agent.repository.ts
import { injectable } from 'inversify';

import { Agent } from '@/core/domain/agent/agent.entity';
import { IAgentRepository } from '@/core/domain/agent/ports/agent-repository.interface';
import { AgentId } from '@/core/domain/agent/value-objects/agent-id.vo';
import { PersonaId } from '@/core/domain/agent/value-objects/persona-id.vo';

import { Result, Ok, Err } from '@/shared/result';

@injectable()
export class InMemoryAgentRepository implements IAgentRepository {
  private readonly agents: Map<string, Agent> = new Map();

  async save(agent: Agent): Promise<Result<void, Error>> {
    this.agents.set(agent.id.value, agent);
    return Ok(undefined);
  }

  async findById(id: AgentId): Promise<Result<Agent | null, Error>> {
    const agent = this.agents.get(id.value);
    return Ok(agent || null);
  }

  async findAll(): Promise<Result<Agent[], Error>> {
    return Ok(Array.from(this.agents.values()));
  }

  async delete(id: AgentId): Promise<Result<void, Error>> {
    if (!this.agents.has(id.value)) {
      return Err(new Error(`Agent with ID ${id.value} not found.`));
    }
    this.agents.delete(id.value);
    return Ok(undefined);
  }

  async findByPersonaId(personaId: PersonaId): Promise<Result<Agent[], Error>> {
    const foundAgents = Array.from(this.agents.values()).filter(agent => agent.personaId.equals(personaId));
    return Ok(foundAgents);
  }
}
