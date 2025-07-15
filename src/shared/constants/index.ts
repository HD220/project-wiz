// Application-wide constants shared between main and renderer processes

// Application Info
export const APP_INFO = {
  NAME: "Project Wiz",
  VERSION: "1.0.0",
  DESCRIPTION: "AI-powered software development factory",
} as const;

// Database Constants
export const DATABASE = {
  DEFAULT_NAME: "project-wiz.db",
  MAX_CONNECTIONS: 10,
  TIMEOUT: 5000,
} as const;

// Agent Constants
export const AGENT = {
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 1000,
  MIN_TEMPERATURE: 0.0,
  MAX_TEMPERATURE: 2.0,
  MIN_MAX_TOKENS: 100,
  MAX_MAX_TOKENS: 4000,
} as const;

// LLM Provider Constants
export const LLM_PROVIDERS = {
  OPENAI: "openai",
  DEEPSEEK: "deepseek",
  ANTHROPIC: "anthropic",
} as const;

// Message Types
export const MESSAGE_TYPES = {
  TEXT: "text",
  CODE: "code",
  FILE: "file",
  SYSTEM: "system",
} as const;

// Sender Types
export const SENDER_TYPES = {
  USER: "user",
  AGENT: "agent",
  SYSTEM: "system",
} as const;

// Project Status
export const PROJECT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
} as const;

// Context Types for messages
export const CONTEXT_TYPES = {
  DIRECT: "direct",
  CHANNEL: "channel",
  GROUP: "group",
} as const;

// IPC Channel Names - Sincronizados com handlers implementados
export const IPC_CHANNELS = {
  // Window controls
  WINDOW_MINIMIZE: "window-minimize",
  WINDOW_MAXIMIZE: "window-maximize",
  WINDOW_CLOSE: "window-close",
  WINDOW_IS_MAXIMIZED: "window-is-maximized",

  // App info
  APP_IS_DEV: "app:is-dev",

  // Agent management
  AGENT_CREATE: "agent:create",
  AGENT_GET_BY_ID: "agent:getById",
  AGENT_GET_BY_NAME: "agent:getByName",
  AGENT_LIST: "agent:list",
  AGENT_LIST_ACTIVE: "agent:listActive",
  AGENT_UPDATE: "agent:update",
  AGENT_DELETE: "agent:delete",
  AGENT_ACTIVATE: "agent:activate",
  AGENT_DEACTIVATE: "agent:deactivate",
  AGENT_SET_DEFAULT: "agent:setDefault",
  AGENT_GET_DEFAULT: "agent:getDefault",

  // Project management
  PROJECT_CREATE: "project:create",
  PROJECT_GET_BY_ID: "project:getById",
  PROJECT_LIST: "project:list",
  PROJECT_UPDATE: "project:update",
  PROJECT_DELETE: "project:delete",
  PROJECT_ARCHIVE: "project:archive",

  // Channel management
  CHANNEL_CREATE: "channel:create",
  CHANNEL_GET_BY_ID: "channel:getById",
  CHANNEL_LIST_BY_PROJECT: "channel:listByProject",
  CHANNEL_LIST_ACCESSIBLE: "channel:listAccessible",
  CHANNEL_CREATE_GENERAL: "channel:createGeneral",
  CHANNEL_DELETE: "channel:delete",

  // Channel messaging
  CHANNEL_MESSAGE_CREATE: "channelMessage:create",
  CHANNEL_MESSAGE_GET_BY_ID: "channelMessage:getById",
  CHANNEL_MESSAGE_LIST_BY_CHANNEL: "channelMessage:listByChannel",
  CHANNEL_MESSAGE_LIST_BY_AUTHOR: "channelMessage:listByAuthor",
  CHANNEL_MESSAGE_DELETE: "channelMessage:delete",
  CHANNEL_MESSAGE_CREATE_TEXT: "channelMessage:createText",
  CHANNEL_MESSAGE_CREATE_CODE: "channelMessage:createCode",
  CHANNEL_MESSAGE_CREATE_SYSTEM: "channelMessage:createSystem",

  // User management
  USER_CREATE: "user:create",
  USER_GET_BY_ID: "user:getById",
  USER_UPDATE_PROFILE: "user:updateProfile",
  USER_UPDATE_SETTINGS: "user:updateSettings",
  USER_GET_PREFERENCES: "user:getPreferences",
  USER_DELETE: "user:delete",

  // Direct messages - Conversations
  DM_CONVERSATION_CREATE: "dm:conversation:create",
  DM_CONVERSATION_GET_BY_ID: "dm:conversation:getById",
  DM_CONVERSATION_LIST: "dm:conversation:list",
  DM_CONVERSATION_FIND_OR_CREATE: "dm:conversation:findOrCreate",

  // Direct messages - Messages
  DM_MESSAGE_CREATE: "dm:message:create",
  DM_MESSAGE_LIST_BY_CONVERSATION: "dm:message:listByConversation",
  DM_AI_SEND_MESSAGE: "dm:ai:sendMessage",
  DM_AGENT_SEND_MESSAGE: "dm:agent:sendMessage",
  DM_AGENT_REGENERATE_RESPONSE: "dm:agent:regenerateResponse",

  // LLM Provider management
  LLM_PROVIDER_CREATE: "llm-provider:create",
  LLM_PROVIDER_GET_BY_ID: "llm-provider:getById",
  LLM_PROVIDER_LIST: "llm-provider:list",
  LLM_PROVIDER_UPDATE: "llm-provider:update",
  LLM_PROVIDER_DELETE: "llm-provider:delete",
  LLM_PROVIDER_SET_DEFAULT: "llm-provider:setDefault",
  LLM_PROVIDER_GET_DEFAULT: "llm-provider:getDefault",
} as const;
