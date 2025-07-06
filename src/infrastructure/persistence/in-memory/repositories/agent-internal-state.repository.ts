import { injectable } from 'inversify';

import { AgentInternalState } from '@/core/domain/agent/agent-internal-state.entity';
import { IAgentInternalStateRepository } from '@/core/domain/agent/ports/agent-internal-state-repository.interface';
import { AgentId } from '@/core/domain/agent/value-objects/agent-id.vo';


@injectable()
export class InMemoryAgentInternalStateRepository
  implements IAgentInternalStateRepository
{
  private readonly states: Map<string, AgentInternalState> = new Map();

  async findByAgentId(agentId: AgentId): Promise<AgentInternalState | null> {
    const state = this.states.get(agentId.value);
    if (!state) {
      return null;
    }
    return state;
  }

  async save(state: AgentInternalState): Promise<void> {
    this.states.set(state.id.value, state);
  }

  async deleteByAgentId(agentId: AgentId): Promise<void> {
    this.states.delete(agentId.value);
  }
}
