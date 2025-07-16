import { EntityData } from "./entity-data.type";
import { EntityUpdatedEvent } from "./entity-updated.event";

export class AgentUpdatedEvent extends EntityUpdatedEvent {
  type = "agent.updated" as const;

  constructor(agentId: string, changes: EntityData, previousData?: EntityData) {
    super(agentId, "agent", changes, previousData);
  }
}
