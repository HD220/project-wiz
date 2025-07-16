import { EntityData } from "./entity-data.type";
import { EntityDeletedEvent } from "./entity-deleted.event";

export class LlmProviderDeletedEvent extends EntityDeletedEvent {
  type = "llm-provider.deleted" as const;

  constructor(providerId: string, deletedProvider: EntityData) {
    super(providerId, "llm-provider", deletedProvider);
  }
}
