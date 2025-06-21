// src/core/ports/agent/agent-executor-config.interface.ts

/**
 * Configuration for an LLM model to be used by the Agent Executor.
 */
export interface AgentExecutorModelConfig {
  provider: string;       // e.g., 'deepseek', 'openai', 'ollama', or a generic identifier
  modelName: string;      // Specific model name, e.g., 'deepseek-chat', 'gpt-4', 'llama2'
  apiKeyEnvVar?: string; // Optional environment variable name for the API key, if not using a global one.
  // Future: Add baseUrl, temperature, topP, etc. if needed per model instance
}

/**
 * Configuration for conversation history summarization.
 */
export interface AgentExecutorSummarizationConfig {
  maxHistoryMessagesBeforeSummary: number;
  numMessagesToSummarizeChunk: number;
  preserveInitialMessagesCount: number;
  /**
   * Optional: Specifies a particular model to use for summarization tasks.
   * If not provided, the mainLLM from AgentExecutorConfig might be used, or a default.
   */
  summarizationModel?: AgentExecutorModelConfig;
}

/**
 * Overall configuration for the GenericAgentExecutor.
 */
export interface AgentExecutorConfig {
  /**
   * The primary Large Language Model configuration to be used for main agent tasks
   * (e.g., planning, tool selection, generating final responses).
   */
  mainLLM: AgentExecutorModelConfig;

  /**
   * Configuration settings for conversation summarization features.
   * If undefined, summarization features might be disabled or use hardcoded defaults (less ideal).
   */
  summarization?: AgentExecutorSummarizationConfig;

  // Future: Add other executor-wide configurations like:
  // defaultMaxRetries?: number;
  // llmCallTimeoutMs?: number;
  // defaultToolExecutionTimeoutMs?: number;
}
