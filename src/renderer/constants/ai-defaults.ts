/**
 * AI-related constants and default values for renderer process
 * Duplicated from main process to avoid boundary violations
 */
export const AI_DEFAULTS = {
  // Model configuration defaults
  TEMPERATURE: 0.7,
  MAX_TOKENS: 4000,
  TOP_P: 1.0,

  // Agent defaults
  DEFAULT_AGENT_STATUS: "inactive" as const,

  // Provider settings
  DEFAULT_PROVIDER_TYPE: "openai" as const,
} as const;
