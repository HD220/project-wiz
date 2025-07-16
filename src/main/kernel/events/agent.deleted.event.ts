import { EntityDeletedEvent } from "./entity-deleted.event";

export class AgentDeletedEvent extends EntityDeletedEvent {
  type = "agent.deleted" as const;

  constructor(agentId: string) {
    super(agentId, "agent", { id: agentId });
  }
}
