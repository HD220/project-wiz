import { injectable } from "inversify";

import { AgentInternalState } from "@/core/domain/agent/agent-internal-state.entity";
import { IAgentInternalStateRepository } from "@/core/domain/agent/ports/agent-internal-state-repository.interface";
import { AgentId } from "@/core/domain/agent/value-objects/agent-id.vo";

import { Result, Ok, Err } from "@/shared/result";

@injectable()
export class InMemoryAgentInternalStateRepository
  implements IAgentInternalStateRepository
{
  private readonly states: Map<string, AgentInternalState> = new Map();

  async save(state: AgentInternalState): Promise<Result<void, Error>> {
    this.states.set(state.id.value, state);
    return Ok(undefined);
  }

  async findByAgentId(
    agentId: AgentId
  ): Promise<Result<AgentInternalState | null, Error>> {
    for (const state of this.states.values()) {
      if (state.agentId.equals(agentId)) {
        return Ok(state);
      }
    }
    return Ok(null);
  }

  async deleteByAgentId(agentId: AgentId): Promise<Result<void, Error>> {
    let found = false;
    for (const [key, state] of this.states) {
      if (state.agentId.equals(agentId)) {
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
