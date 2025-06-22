// src_refactored/core/ports/adapters/llm-adapter.types.ts

/**
 * Options for LLM text generation.
 * These are common options; specific adapters might support more.
 */
export interface LLMGenerationOptions {
  /**
   * Identifier for the specific model to be used (e.g., "gpt-4", "claude-2").
   * If not provided, the adapter might use a default model.
   */
  modelId?: string;

  /**
   * Controls randomness: lower values (e.g., 0.2) make the output more focused and deterministic,
   * higher values (e.g., 0.8) make it more random.
   * Typically ranges from 0.0 to 1.0 or 2.0 depending on the provider.
   */
  temperature?: number;

  /**
   * The maximum number of tokens to generate in the completion.
   */
  maxTokens?: number;

  /**
   * A list of sequences where the API will stop generating further tokens.
   */
  stopSequences?: string[];

  /**
   * Nucleus sampling: an alternative to temperature. The model considers the results of
   * the tokens with top_p probability mass. So 0.1 means only tokens comprising the top 10%
   * probability mass are considered.
   * Typically ranges from 0.0 to 1.0.
   */
  topP?: number;

  /**
   * Number between -2.0 and 2.0. Positive values penalize new tokens based on whether
   * they appear in the text so far, increasing the model's likelihood to talk about new topics.
   */
  presencePenalty?: number;

  /**
   * Number between -2.0 and 2.0. Positive values penalize new tokens based on their
   * existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
   */
  frequencyPenalty?: number;

  /**
   * The user ID to associate with the request, for monitoring and abuse detection purposes.
   * Some providers like OpenAI recommend using this.
   */
  userId?: string;

  // Additional provider-specific options can be added using a flexible structure if needed:
  // [key: string]: any;
}

/**
 * Represents a single choice or message from an LLM response,
 * particularly relevant for chat-like interactions or when multiple choices are returned.
 */
export interface LLMResponseMessage {
  role: 'assistant' | 'tool' | 'system' | 'user'; // Role of the message author
  content: string | null; // Text content of the message
  toolCalls?: any[]; // If the LLM requests tool calls
}
