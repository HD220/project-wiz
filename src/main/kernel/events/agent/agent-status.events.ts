import { BaseEvent } from "../base.events";
import { EVENT_TYPES } from "../event-types";

export class AgentActivatedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.AGENT_ACTIVATED, entityId);
  }
}

export class AgentDeactivatedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.AGENT_DEACTIVATED, entityId);
  }
}
