// src_refactored/core/ports/adapters/llm-adapter.interface.ts
import { z } from 'zod';
import { Result } from '../../../shared/result';
import { LLMError } from '../../common/errors';
import { LLMGenerationOptions } from './llm-adapter.types';

/**
 * Interface for an LLM (Large Language Model) Adapter.
 * This abstraction allows the application to interact with different LLM providers
 * or implementations through a consistent API.
 */
import { Result } from '../../../shared/result';
import { LLMError } from '../../common/errors';
import { LLMGenerationOptions, LanguageModelMessage } from './llm-adapter.types';

/**
 * Interface for an LLM (Large Language Model) Adapter.
 * This abstraction allows the application to interact with different LLM providers
 * or implementations through a consistent API.
 */
export interface ILLMAdapter {
  /**
   * Generates a language model response based on a sequence of messages.
   * The response can include text content and/or tool calls.
   *
   * @param messages - An array of LanguageModelMessage objects representing the conversation history.
   * @param options - Optional parameters to control the generation process.
   * @returns A Promise that resolves to a Result containing the assistant's LanguageModelMessage response or an LLMError.
   */
  generateText(
    messages: LanguageModelMessage[],
    options?: LLMGenerationOptions,
  ): Promise<Result<LanguageModelMessage, LLMError>>;

  /**
   * Generates structured output that conforms to a provided Zod schema.
   * The adapter implementation is responsible for instructing the LLM to produce
   * output in a format (e.g., JSON) that can be parsed and validated against the schema.
   *
   * @template S - The Zod schema type.
   * @param prompt - The input string prompt for the LLM.
   * @param schema - The Zod schema to which the output should conform.
   * @param options - Optional parameters to control the generation process.
   * @returns A Promise that resolves to a Result containing the parsed and validated structured data (of type `z.infer<S>`) or an LLMError.
   *          The error may indicate issues with LLM generation, output parsing, or schema validation.
   */
  generateStructuredOutput<S extends z.ZodTypeAny>(
    prompt: string,
    schema: S,
    options?: LLMGenerationOptions,
  ): Promise<Result<z.infer<S>, LLMError>>;

  /**
   * Generates text as an asynchronous stream based on a given prompt and options.
   * Each yielded item is a Result, allowing for streamed error handling or partial results.
   * This method is optional for an adapter to implement.
   *
   * @param prompt - The input string prompt for the LLM.
   * @param options - Optional parameters to control the generation process.
   * @returns An AsyncGenerator that yields Results, each containing a chunk of the generated text string or an LLMError.
   */
  streamText?(
    prompt: string,
    options?: LLMGenerationOptions,
  ): AsyncGenerator<Result<string, LLMError>>;

  // Potential future additions:
  // - generateChatCompletion(messages: ChatMessage[], options?: LLMGenerationOptions): Promise<Result<ChatMessage, LLMError>>;
  // - countTokens(text: string, modelId?: string): Promise<Result<number, LLMError>>;
  // - listAvailableModels?(): Promise<Result<string[], LLMError>>;
}

export const ILLMAdapterToken = Symbol('ILLMAdapter');
