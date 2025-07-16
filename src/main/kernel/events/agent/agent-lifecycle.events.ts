import { BaseEvent } from "../base.events";
import { EVENT_TYPES } from "../event-types";

import { AgentEventData, AgentUpdateData } from "./agent-data";

export class AgentCreatedEvent extends BaseEvent {
  constructor(
    entityId: string,
    public readonly agent: AgentEventData,
  ) {
    super(EVENT_TYPES.AGENT_CREATED, entityId);
  }
}

export class AgentUpdatedEvent extends BaseEvent {
  constructor(
    entityId: string,
    public readonly updates: AgentUpdateData,
  ) {
    super(EVENT_TYPES.AGENT_UPDATED, entityId);
  }
}

export class AgentDeletedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.AGENT_DELETED, entityId);
  }
}
