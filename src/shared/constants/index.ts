// Application-wide constants shared between main and renderer processes

// Application Info
export const APP_INFO = {
  NAME: 'Project Wiz',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-powered software development factory',
} as const;

// Database Constants
export const DATABASE = {
  DEFAULT_NAME: 'project-wiz.db',
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
  OPENAI: 'openai',
  DEEPSEEK: 'deepseek',
  ANTHROPIC: 'anthropic',
} as const;

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  CODE: 'code', 
  FILE: 'file',
  SYSTEM: 'system',
} as const;

// Sender Types
export const SENDER_TYPES = {
  USER: 'user',
  AGENT: 'agent', 
  SYSTEM: 'system',
} as const;

// Project Status
export const PROJECT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
} as const;

// Context Types for messages
export const CONTEXT_TYPES = {
  DIRECT: 'direct',
  CHANNEL: 'channel',
  GROUP: 'group',
} as const;

// IPC Channel Names
export const IPC_CHANNELS = {
  // Window controls
  WINDOW_MINIMIZE: 'window-minimize',
  WINDOW_MAXIMIZE: 'window-maximize', 
  WINDOW_CLOSE: 'window-close',
  WINDOW_IS_MAXIMIZED: 'window-is-maximized',
  
  // App info
  APP_IS_DEV: 'app:is-dev',
  
  // Agent management
  AGENT_CREATE: 'agent:create',
  AGENT_GET_ALL: 'agent:get-all',
  AGENT_GET_BY_ID: 'agent:get-by-id',
  AGENT_UPDATE: 'agent:update',
  AGENT_DELETE: 'agent:delete',
  
  // Project management
  PROJECT_CREATE: 'project:create',
  PROJECT_GET_ALL: 'project:get-all',
  PROJECT_GET_BY_ID: 'project:get-by-id',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  
  // LLM Provider management
  LLM_PROVIDER_CREATE: 'llm-provider:create',
  LLM_PROVIDER_GET_ALL: 'llm-provider:get-all',
  LLM_PROVIDER_GET_BY_ID: 'llm-provider:get-by-id',
  LLM_PROVIDER_UPDATE: 'llm-provider:update',
  LLM_PROVIDER_DELETE: 'llm-provider:delete',
  
  // Direct messages
  CONVERSATION_CREATE: 'conversation:create',
  CONVERSATION_GET_ALL: 'conversation:get-all',
  CONVERSATION_GET_BY_ID: 'conversation:get-by-id',
  MESSAGE_SEND: 'message:send',
  MESSAGE_GET_BY_CONVERSATION: 'message:get-by-conversation',
  
  // Channel messaging
  CHANNEL_CREATE: 'channel:create',
  CHANNEL_GET_ALL: 'channel:get-all',
  CHANNEL_MESSAGE_SEND: 'channel-message:send',
  CHANNEL_MESSAGE_GET_BY_CHANNEL: 'channel-message:get-by-channel',
} as const;