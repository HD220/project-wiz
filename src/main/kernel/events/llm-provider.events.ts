import { EntityCreatedEvent, EntityUpdatedEvent, EntityDeletedEvent } from './base.events';

// LLM Provider Events
export class LlmProviderCreatedEvent extends EntityCreatedEvent {
  type = 'llm-provider.created' as const;

  constructor(
    providerId: string,
    public readonly provider: {
      name: string;
      provider: string;
      model: string;
      isDefault: boolean;
    }
  ) {
    super(providerId, 'llm-provider', provider);
  }
}

export class LlmProviderUpdatedEvent extends EntityUpdatedEvent {
  type = 'llm-provider.updated' as const;

  constructor(
    providerId: string,
    changes: Record<string, any>,
    previousData?: Record<string, any>
  ) {
    super(providerId, 'llm-provider', changes, previousData);
  }
}

export class LlmProviderDeletedEvent extends EntityDeletedEvent {
  type = 'llm-provider.deleted' as const;

  constructor(providerId: string, deletedProvider: Record<string, any>) {
    super(providerId, 'llm-provider', deletedProvider);
  }
}

export class LlmProviderSetAsDefaultEvent extends EntityUpdatedEvent {
  type = 'llm-provider.set-as-default' as const;

  constructor(providerId: string, previousDefaultId?: string) {
    super(providerId, 'llm-provider', { isDefault: true }, { previousDefaultId });
  }
}