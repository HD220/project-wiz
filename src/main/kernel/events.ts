import { IEvent } from './event-bus';

// Event Types Constants
export const EVENT_TYPES = {
  // Agent Events
  AGENT_CREATED: 'agent.created',
  AGENT_UPDATED: 'agent.updated',
  AGENT_DELETED: 'agent.deleted',
  AGENT_ACTIVATED: 'agent.activated',
  AGENT_DEACTIVATED: 'agent.deactivated',
  
  // LLM Provider Events
  LLM_PROVIDER_CREATED: 'llm-provider.created',
  LLM_PROVIDER_UPDATED: 'llm-provider.updated',
  LLM_PROVIDER_DELETED: 'llm-provider.deleted',
  
  // Project Events
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_DELETED: 'project.deleted',
  
  // Channel Events
  CHANNEL_CREATED: 'channel.created',
  CHANNEL_UPDATED: 'channel.updated',
  CHANNEL_DELETED: 'channel.deleted',
  
  // Message Events
  MESSAGE_SENT: 'message.sent',
  MESSAGE_UPDATED: 'message.updated',
  MESSAGE_DELETED: 'message.deleted',
  
  // Conversation Events
  CONVERSATION_STARTED: 'conversation.started',
  CONVERSATION_ENDED: 'conversation.ended',
} as const;

// Base Event Classes
export abstract class BaseEvent implements IEvent {
  public readonly timestamp: Date;
  
  constructor(
    public readonly type: string,
    public readonly entityId: string,
    public readonly id?: string
  ) {
    this.timestamp = new Date();
  }
}

// Agent Events
export class AgentCreatedEvent extends BaseEvent {
  constructor(
    entityId: string,
    public readonly agent: {
      id: string;
      name: string;
      role: string;
      goal: string;
      backstory: string;
      llmProviderId: string;
    }
  ) {
    super(EVENT_TYPES.AGENT_CREATED, entityId);
  }
}

export class AgentUpdatedEvent extends BaseEvent {
  constructor(
    entityId: string,
    public readonly updates: Partial<{
      name: string;
      role: string;
      goal: string;
      backstory: string;
      llmProviderId: string;
      temperature: number;
      maxTokens: number;
      isActive: boolean;
    }>
  ) {
    super(EVENT_TYPES.AGENT_UPDATED, entityId);
  }
}

export class AgentDeletedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.AGENT_DELETED, entityId);
  }
}

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

// LLM Provider Events
export class LlmProviderCreatedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.LLM_PROVIDER_CREATED, entityId);
  }
}

export class LlmProviderUpdatedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.LLM_PROVIDER_UPDATED, entityId);
  }
}

export class LlmProviderDeletedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.LLM_PROVIDER_DELETED, entityId);
  }
}

// Project Events
export class ProjectCreatedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.PROJECT_CREATED, entityId);
  }
}

export class ProjectUpdatedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.PROJECT_UPDATED, entityId);
  }
}

export class ProjectDeletedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.PROJECT_DELETED, entityId);
  }
}

// Channel Events
export class ChannelCreatedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.CHANNEL_CREATED, entityId);
  }
}

export class ChannelUpdatedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.CHANNEL_UPDATED, entityId);
  }
}

export class ChannelDeletedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.CHANNEL_DELETED, entityId);
  }
}

// Message Events
export class MessageSentEvent extends BaseEvent {
  constructor(
    entityId: string,
    public readonly message: {
      id: string;
      content: string;
      senderId: string;
      conversationId?: string;
    }
  ) {
    super(EVENT_TYPES.MESSAGE_SENT, entityId);
  }
}

export class MessageUpdatedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.MESSAGE_UPDATED, entityId);
  }
}

export class MessageDeletedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.MESSAGE_DELETED, entityId);
  }
}

// Conversation Events
export class ConversationStartedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.CONVERSATION_STARTED, entityId);
  }
}

export class ConversationEndedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.CONVERSATION_ENDED, entityId);
  }
}