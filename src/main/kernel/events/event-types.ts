export const EVENT_TYPES = {
  // Agent Events
  AGENT_CREATED: "agent.created",
  AGENT_UPDATED: "agent.updated",
  AGENT_DELETED: "agent.deleted",
  AGENT_ACTIVATED: "agent.activated",
  AGENT_DEACTIVATED: "agent.deactivated",

  // LLM Provider Events
  LLM_PROVIDER_CREATED: "llm-provider.created",
  LLM_PROVIDER_UPDATED: "llm-provider.updated",
  LLM_PROVIDER_DELETED: "llm-provider.deleted",

  // Project Events
  PROJECT_CREATED: "project.created",
  PROJECT_UPDATED: "project.updated",
  PROJECT_DELETED: "project.deleted",

  // Channel Events
  CHANNEL_CREATED: "channel.created",
  CHANNEL_UPDATED: "channel.updated",
  CHANNEL_DELETED: "channel.deleted",

  // Message Events
  MESSAGE_SENT: "message.sent",
  MESSAGE_UPDATED: "message.updated",
  MESSAGE_DELETED: "message.deleted",

  // Conversation Events
  CONVERSATION_STARTED: "conversation.started",
  CONVERSATION_ENDED: "conversation.ended",
} as const;
