// Central export for all domain events
export * from './base.events';
export * from './agent.events';
export * from './project.events';
export * from './message.events';
export * from './llm-provider.events';

// Event type constants for easy reference
export const EVENT_TYPES = {
  // Agent events
  AGENT_CREATED: 'agent.created',
  AGENT_UPDATED: 'agent.updated', 
  AGENT_DELETED: 'agent.deleted',
  AGENT_ACTIVATED: 'agent.activated',
  AGENT_DEACTIVATED: 'agent.deactivated',

  // Project events
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_DELETED: 'project.deleted',
  PROJECT_STATUS_CHANGED: 'project.status.changed',

  // Message events
  MESSAGE_SENT: 'message.sent',
  MESSAGE_EDITED: 'message.edited',
  CONVERSATION_STARTED: 'conversation.started',
  CHANNEL_CREATED: 'channel.created',
  AI_MESSAGE_GENERATED: 'ai.message.generated',

  // LLM Provider events
  LLM_PROVIDER_CREATED: 'llm-provider.created',
  LLM_PROVIDER_UPDATED: 'llm-provider.updated',
  LLM_PROVIDER_DELETED: 'llm-provider.deleted',
  LLM_PROVIDER_SET_AS_DEFAULT: 'llm-provider.set-as-default',
} as const;