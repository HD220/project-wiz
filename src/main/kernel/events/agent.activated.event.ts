import { EntityUpdatedEvent } from "./entity-updated.event";

export class AgentActivatedEvent extends EntityUpdatedEvent {
  type = "agent.activated" as const;

  constructor(agentId: string) {
    super(agentId, "agent", { isActive: true });
  }
}
