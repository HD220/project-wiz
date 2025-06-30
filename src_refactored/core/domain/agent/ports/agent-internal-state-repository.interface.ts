// src_refactored/core/domain/agent/ports/agent-internal-state-repository.interface.ts
import { Result } from '../../../../shared/result';
import { AgentInternalState } from '../agent-internal-state.entity';
import { AgentId } from '../value-objects/agent-id.vo';

export interface IAgentInternalStateRepository {
  save(state: AgentInternalState): Promise<Result<void>>;
  findByAgentId(agentId: AgentId): Promise<Result<AgentInternalState | null>>;
  deleteByAgentId(agentId: AgentId): Promise<Result<void>>;
}
