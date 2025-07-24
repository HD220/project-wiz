/**
 * AI-related constants and default values for renderer process
 * Duplicated from main process to avoid boundary violations
 */
export const AI_DEFAULTS = {
  // Model configuration defaults
  TEMPERATURE: 0.7,
  MAX_TOKENS: 4000,
  TOP_P: 1.0,
  FREQUENCY_PENALTY: 0.0,
  PRESENCE_PENALTY: 0.0,

  // Agent defaults
  DEFAULT_AGENT_STATUS: "inactive" as const,

  // Provider settings
  DEFAULT_PROVIDER_TYPE: "openai" as const,
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
