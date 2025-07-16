import { EntityCreatedEvent } from "./entity-created.event";

export class LlmProviderCreatedEvent extends EntityCreatedEvent {
  type = "llm-provider.created" as const;

  constructor(
    providerId: string,
    provider: {
      name: string;
      provider: string;
      model: string;
      isDefault: boolean;
    },
  ) {
    super(providerId, "llm-provider", provider);
  }
}
