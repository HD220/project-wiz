/**
 * AI-related constants and default values
 */
export const AI_DEFAULTS = {
  // Model configuration defaults
  TEMPERATURE: 0.7,
  MAX_TOKENS: 4000,
  TOP_P: 1.0,
  FREQUENCY_PENALTY: 0.0,
  PRESENCE_PENALTY: 0.0,

  // Memory settings
  MEMORY_RETENTION_DAYS: 30,
  MAX_MEMORY_ENTRIES: 1000,
  MEMORY_RELEVANCE_THRESHOLD: 0.5,

  // Conversation limits
  MAX_CONVERSATION_HISTORY: 10,
  MAX_MESSAGE_LENGTH: 32000,

  // Agent defaults
  DEFAULT_AGENT_STATUS: "inactive" as const,
  MAX_AGENTS_PER_USER: 50,

  // Provider settings
  DEFAULT_PROVIDER_TYPE: "openai" as const,
  API_TIMEOUT_MS: 30000,
  MAX_RETRIES: 3,

  // Session management
  SESSION_DURATION_MS: 24 * 60 * 60 * 1000, // 24 hours
  SESSION_CLEANUP_INTERVAL_MS: 60 * 60 * 1000, // 1 hour

  // Database performance
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 1000,
  QUERY_TIMEOUT_MS: 10000,

  // File upload limits
  MAX_AVATAR_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: [".jpg", ".jpeg", ".png", ".webp"] as const,
} as const;

/**
 * Model-specific defaults
 */
export const MODEL_DEFAULTS = {
  ["gpt-4o"]: {
    temperature: 0.7,
    maxTokens: 4000,
    topP: 1.0,
  },
  ["gpt-4o-mini"]: {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0,
  },
  ["deepseek-coder"]: {
    temperature: 0.3,
    maxTokens: 8000,
    topP: 0.95,
  },
  ["claude-3-5-sonnet-20241022"]: {
    temperature: 0.7,
    maxTokens: 4000,
    topP: 1.0,
  },
  ["gemini-pro"]: {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0,
  },
} as const;

/**
 * System prompt templates
 */
export const SYSTEM_PROMPTS = {
  DEFAULT:
    "You are a helpful AI assistant. Provide clear, accurate, and helpful responses.",

  CODE_ASSISTANT:
    "You are an expert software developer and code reviewer. Help with coding tasks, debugging, and best practices.",

  RESEARCH_ASSISTANT:
    "You are a research assistant. Help analyze information, summarize content, and provide insights.",

  CREATIVE_WRITER:
    "You are a creative writing assistant. Help with storytelling, content creation, and creative projects.",
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  AGENT_NOT_FOUND: "Agent not found",
  PROVIDER_NOT_FOUND: "LLM Provider not found",
  USER_NOT_AUTHENTICATED: "User not authenticated",
  INVALID_API_KEY: "Invalid API key",
  RATE_LIMIT_EXCEEDED: "Rate limit exceeded",
  MODEL_NOT_AVAILABLE: "Model not available",
  CONVERSATION_NOT_FOUND: "Conversation not found",
  MEMORY_STORAGE_FAILED: "Failed to store memory",
} as const;
