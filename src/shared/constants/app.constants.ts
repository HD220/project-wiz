/**
 * Application-wide constants
 * Centralized configuration for all magic numbers and strings
 */

// Application metadata
export const APP_CONSTANTS = {
  NAME: "Project Wiz",
  VERSION: "1.0.0",
  DESCRIPTION:
    "Aplicação desktop para automação do ciclo de vida de desenvolvimento de software com Agentes de IA.",
} as const;

// Database configuration
export const DB_CONSTANTS = {
  DEFAULT_DB_NAME: "project-wiz.db",
  MIGRATIONS_PATH: "./src/main/persistence/migrations",
  CONNECTION_TIMEOUT: 5000,
  MAX_CONNECTIONS: 10,
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  URL_MAX_LENGTH: 2048,
  MESSAGE_MAX_LENGTH: 10000,
  TOKEN_MAX_LENGTH: 1000,
} as const;

// Time constants (in milliseconds)
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  DEFAULT_TIMEOUT: 30 * 1000, // 30 seconds
  API_TIMEOUT: 60 * 1000, // 60 seconds
  DEBOUNCE_DELAY: 300, // 300ms
  THROTTLE_DELAY: 1000, // 1 second
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10 MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5 MB
  MAX_DOCUMENT_SIZE: 20 * 1024 * 1024, // 20 MB
  MAX_CODE_FILE_SIZE: 1 * 1024 * 1024, // 1 MB
} as const;

// UI constants
export const UI_CONSTANTS = {
  SIDEBAR_WIDTH: 280,
  SIDEBAR_COLLAPSED_WIDTH: 60,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 48,
  MODAL_Z_INDEX: 50,
  TOAST_Z_INDEX: 100,
  MAX_TOAST_DURATION: 5000,
  ANIMATION_DURATION: 200,
} as const;

// LLM Provider constants
export const LLM_CONSTANTS = {
  DEFAULT_TEMPERATURE: 0.7,
  MIN_TEMPERATURE: 0,
  MAX_TEMPERATURE: 2,
  DEFAULT_MAX_TOKENS: 1000,
  MIN_MAX_TOKENS: 1,
  MAX_MAX_TOKENS: 4096,
  DEFAULT_TOP_P: 1,
  DEFAULT_FREQUENCY_PENALTY: 0,
  DEFAULT_PRESENCE_PENALTY: 0,
} as const;

// Agent constants
export const AGENT_CONSTANTS = {
  DEFAULT_ITERATIONS: 3,
  MIN_ITERATIONS: 1,
  MAX_ITERATIONS: 10,
  DEFAULT_TASK_PRIORITY: "medium",
  TASK_STATUS_TRANSITIONS: {
    pending: ["in_progress", "cancelled"],
    in_progress: ["completed", "failed", "paused"],
    paused: ["in_progress", "cancelled"],
    completed: [],
    failed: ["pending"],
    cancelled: [],
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: "An unexpected error occurred. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again.",
  SERVER: "Server error. Please try again later.",
  TIMEOUT: "Request timed out. Please try again.",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: "Changes saved successfully.",
  CREATED: "Created successfully.",
  UPDATED: "Updated successfully.",
  DELETED: "Deleted successfully.",
  COPIED: "Copied to clipboard.",
} as const;

// Regular expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

// Environment variable names
export const ENV_VARS = {
  OPENAI_API_KEY: "OPENAI_API_KEY",
  DEEPSEEK_API_KEY: "DEEPSEEK_API_KEY",
  DATABASE_URL: "DATABASE_URL",
  LOG_LEVEL: "LOG_LEVEL",
  NODE_ENV: "NODE_ENV",
} as const;

// Storage keys
export const STORAGE_KEYS = {
  THEME: "app-theme",
  LANGUAGE: "app-language",
  USER_PREFERENCES: "user-preferences",
  AUTH_TOKEN: "auth-token",
  LAST_PROJECT: "last-project-id",
} as const;

// IPC Channel Constants
export const IPC_CHANNELS = {
  // Agent channels
  AGENT_CREATE: "agent:create",
  AGENT_GET_BY_ID: "agent:getById",
  AGENT_LIST: "agent:list",
  AGENT_LIST_ACTIVE: "agent:listActive",
  AGENT_UPDATE: "agent:update",
  AGENT_DELETE: "agent:delete",
  AGENT_ACTIVATE: "agent:activate",
  AGENT_DEACTIVATE: "agent:deactivate",
  AGENT_SET_DEFAULT: "agent:setDefault",
  AGENT_GET_DEFAULT: "agent:getDefault",

  // Project channels
  PROJECT_CREATE: "project:create",
  PROJECT_GET_BY_ID: "project:getById",
  PROJECT_LIST: "project:list",
  PROJECT_UPDATE: "project:update",
  PROJECT_DELETE: "project:delete",
  PROJECT_ARCHIVE: "project:archive",

  // User channels
  USER_CREATE: "user:create",
  USER_GET_BY_ID: "user:getById",
  USER_LIST: "user:list",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",

  // LLM channels
  LLM_CREATE_PROVIDER: "llm:createProvider",
  LLM_GET_PROVIDER: "llm:getProvider",
  LLM_LIST_PROVIDERS: "llm:listProviders",
  LLM_UPDATE_PROVIDER: "llm:updateProvider",
  LLM_DELETE_PROVIDER: "llm:deleteProvider",
  LLM_SET_DEFAULT: "llm:setDefault",

  // Window channels
  WINDOW_MINIMIZE: "window:minimize",
  WINDOW_MAXIMIZE: "window:maximize",
  WINDOW_CLOSE: "window:close",
  WINDOW_TOGGLE_MAXIMIZE: "window:toggleMaximize",
  WINDOW_IS_MAXIMIZED: "window:isMaximized",

  // App channels
  APP_IS_DEV: "app:isDev",

  // Legacy structured format (for compatibility)
  AGENTS: {
    CREATE: "agent:create",
    GET_BY_ID: "agent:getById",
    LIST: "agent:list",
    LIST_ACTIVE: "agent:listActive",
    UPDATE: "agent:update",
    DELETE: "agent:delete",
    ACTIVATE: "agent:activate",
    DEACTIVATE: "agent:deactivate",
  },
  PROJECTS: {
    CREATE: "project:create",
    GET_BY_ID: "project:getById",
    LIST: "project:list",
    UPDATE: "project:update",
    DELETE: "project:delete",
    ARCHIVE: "project:archive",
  },
  USERS: {
    CREATE: "user:create",
    GET_BY_ID: "user:getById",
    LIST: "user:list",
    UPDATE: "user:update",
    DELETE: "user:delete",
  },
  LLM: {
    CREATE_PROVIDER: "llm:createProvider",
    GET_PROVIDER: "llm:getProvider",
    LIST_PROVIDERS: "llm:listProviders",
    UPDATE_PROVIDER: "llm:updateProvider",
    DELETE_PROVIDER: "llm:deleteProvider",
    SET_DEFAULT: "llm:setDefault",
  },
  WINDOW: {
    MINIMIZE: "window:minimize",
    MAXIMIZE: "window:maximize",
    CLOSE: "window:close",
    TOGGLE_MAXIMIZE: "window:toggleMaximize",
  },
} as const;

export default {
  APP: APP_CONSTANTS,
  DB: DB_CONSTANTS,
  VALIDATION: VALIDATION_LIMITS,
  TIME: TIME_CONSTANTS,
  PAGINATION: PAGINATION_DEFAULTS,
  FILE_SIZE: FILE_SIZE_LIMITS,
  UI: UI_CONSTANTS,
  LLM: LLM_CONSTANTS,
  AGENT: AGENT_CONSTANTS,
  ERROR: ERROR_MESSAGES,
  SUCCESS: SUCCESS_MESSAGES,
  REGEX: REGEX_PATTERNS,
  ENV: ENV_VARS,
  STORAGE: STORAGE_KEYS,
  IPC: IPC_CHANNELS,
} as const;
