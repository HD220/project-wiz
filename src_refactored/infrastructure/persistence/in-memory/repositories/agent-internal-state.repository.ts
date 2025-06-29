// src_refactored/infrastructure/persistence/in-memory/repositories/agent-internal-state.repository.ts
import { injectable } from 'inversify';

import { AgentInternalState } from '@/core/domain/agent/agent-internal-state.entity';
import { IAgentInternalStateRepository } from '@/core/domain/agent/ports/agent-internal-state-repository.interface';
import { AgentId } from '@/core/domain/agent/value-objects/agent-id.vo';

import { Result, Ok, Err } from '@/shared/result';


@injectable()
export class InMemoryAgentInternalStateRepository implements IAgentInternalStateRepository {
  private readonly states: Map<string, AgentInternalState> = new Map();

  async save(state: AgentInternalState): Promise<Result<void, Error>> {
    this.states.set(state.id.value, state);
    return Ok(undefined);
  }

  async findByAgentId(agentId: AgentId): Promise<Result<AgentInternalState | null, Error>> {
    // This assumes one state per agentId, might need adjustment if agentId is not the primary key of state
    for (const state of this.states.values()) {
      if (state.agentId.equals(agentId)) { // Assuming AgentInternalState has an agentId property
        return Ok(state);
      }
    }
    return Ok(null);
  }

  async deleteByAgentId(agentId: AgentId): Promise<Result<void, Error>> {
    let found = false;
    for (const [key, state] of this.states) {
      if (state.agentId.equals(agentId)) { // Assuming AgentInternalState has an agentId property
        this.states.delete(key);
        found = true;
        break;
      }
    }
    if (!found) {
      return Err(new Error(`State for agent ID ${agentId.value} not found.`));
    }
    return Ok(undefined);
  }
}
