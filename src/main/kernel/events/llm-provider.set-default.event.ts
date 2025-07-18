import { EntityUpdatedEvent } from "./entity-updated.event";

export class LlmProviderSetAsDefaultEvent extends EntityUpdatedEvent {
  type = "llm-provider.set-as-default" as const;

  constructor(providerId: string, previousDefaultId?: string) {
    super(
      providerId,
      "llm-provider",
      { isDefault: true },
      { previousDefaultId },
    );
  }
}
