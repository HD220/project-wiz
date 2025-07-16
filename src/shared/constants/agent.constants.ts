export const AGENT = {
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 1000,
  MIN_TEMPERATURE: 0.0,
  MAX_TEMPERATURE: 2.0,
  MIN_MAX_TOKENS: 100,
  MAX_MAX_TOKENS: 4000,
} as const;

export const LLM_PROVIDERS = {
  OPENAI: "openai",
  DEEPSEEK: "deepseek",
  ANTHROPIC: "anthropic",
} as const;
