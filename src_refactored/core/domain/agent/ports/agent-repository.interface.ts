// src_refactored/core/domain/agent/ports/agent-repository.interface.ts
import { Result } from '@/shared/result';

import { Agent } from '../agent.entity';
import { AgentId } from '../value-objects/agent-id.vo';
import { PersonaId } from '../value-objects/persona/persona-id.vo';

export interface IAgentRepository {
  save(agent: Agent): Promise<Result<void>>;
  findById(id: AgentId): Promise<Result<Agent | null>>;
  // findAllByPersonaId(personaId: PersonaId): Promise<Result<Agent[]>>; // If multiple agents can use same persona template
  findAll(): Promise<Result<Agent[]>>;
  delete(id: AgentId): Promise<Result<void>>;
}
