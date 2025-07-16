import { EntityData } from "./entity-data.type";
import { EntityUpdatedEvent } from "./entity-updated.event";

export class LlmProviderUpdatedEvent extends EntityUpdatedEvent {
  type = "llm-provider.updated" as const;

  constructor(
    providerId: string,
    changes: EntityData,
    previousData?: EntityData,
  ) {
    super(providerId, "llm-provider", changes, previousData);
  }
}
