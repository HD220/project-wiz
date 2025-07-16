import { BaseEvent } from "./base.events";
import { EVENT_TYPES } from "./event-types";

export class LlmProviderCreatedEvent extends BaseEvent {
  constructor(
    entityId: string,
    public readonly provider: LlmProviderEventData,
  ) {
    super(EVENT_TYPES.LLM_PROVIDER_CREATED, entityId);
  }
}

export class LlmProviderUpdatedEvent extends BaseEvent {
  constructor(
    entityId: string,
    public readonly updates: LlmProviderUpdateData,
  ) {
    super(EVENT_TYPES.LLM_PROVIDER_UPDATED, entityId);
  }
}

export class LlmProviderDeletedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.LLM_PROVIDER_DELETED, entityId);
  }
}

interface LlmProviderEventData {
  id: string;
  name: string;
  provider: string;
  model: string;
  apiKey: string;
  isDefault: boolean;
}

interface LlmProviderUpdateData {
  name?: string;
  provider?: string;
  model?: string;
  apiKey?: string;
  isDefault?: boolean;
  temperature?: number;
  maxTokens?: number;
  isActive?: boolean;
}
