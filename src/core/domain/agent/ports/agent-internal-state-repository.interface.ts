// src/core/domain/agent/ports/agent-internal-state-repository.interface.ts

import { AgentInternalState } from "../agent-internal-state.entity";
import { AgentId } from "../value-objects/agent-id.vo";

export interface IAgentInternalStateRepository {
  save(state: AgentInternalState): Promise<void>;
  findByAgentId(agentId: AgentId): Promise<AgentInternalState | null>;
  deleteByAgentId(agentId: AgentId): Promise<void>;
}
