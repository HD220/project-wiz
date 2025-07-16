import { EntityUpdatedEvent } from "./entity-updated.event";

export class AgentDeactivatedEvent extends EntityUpdatedEvent {
  type = "agent.deactivated" as const;

  constructor(agentId: string) {
    super(agentId, "agent", { isActive: false });
  }
}
