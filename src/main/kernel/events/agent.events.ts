import {
  EntityCreatedEvent,
  EntityUpdatedEvent,
  EntityDeletedEvent,
  EntityData,
} from "./base.events";

// Agent Events
export class AgentCreatedEvent extends EntityCreatedEvent {
  type = "agent.created" as const;

  constructor(
    agentId: string,
    public readonly agent: {
      id: string;
      name: string;
      role: string;
      goal: string;
      backstory: string;
      llmProviderId: string;
    },
  ) {
    super(agentId, "agent", agent);
  }
}

export class AgentUpdatedEvent extends EntityUpdatedEvent {
  type = "agent.updated" as const;

  constructor(agentId: string, changes: EntityData, previousData?: EntityData) {
    super(agentId, "agent", changes, previousData);
  }
}

export class AgentDeletedEvent extends EntityDeletedEvent {
  type = "agent.deleted" as const;

  constructor(agentId: string, deletedAgent: EntityData) {
    super(agentId, "agent", deletedAgent);
  }
}

export class AgentActivatedEvent extends EntityUpdatedEvent {
  type = "agent.activated" as const;

  constructor(agentId: string) {
    super(agentId, "agent", { isActive: true });
  }
}

export class AgentDeactivatedEvent extends EntityUpdatedEvent {
  type = "agent.deactivated" as const;

  constructor(agentId: string) {
    super(agentId, "agent", { isActive: false });
  }
}
