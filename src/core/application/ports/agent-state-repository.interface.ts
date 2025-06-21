import { AgentInternalState, AgentId } from '@/core/domain/entities/agent'; // Adjust path
import { IRepository } from './repository.interface';

// AgentInternalState might not use a generic ID if agentId is its primary key
export interface IAgentStateRepository {
  findByAgentId(agentId: AgentId): Promise<AgentInternalState | null>;
  save(agentState: AgentInternalState): Promise<void>;
}
