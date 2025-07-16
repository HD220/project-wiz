import { EntityCreatedEvent } from "./entity-created.event";

export class AgentCreatedEvent extends EntityCreatedEvent {
  type = "agent.created" as const;

  constructor(
    agentId: string,
    agent: {
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
