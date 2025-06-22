// src_refactored/core/application/use-cases/llm-provider-config/create-llm-provider-config.schema.ts
import { z } from 'zod';

/**
 * Input schema for CreateLLMProviderConfigUseCase.
 */
export const CreateLLMProviderConfigUseCaseInputSchema = z.object({
  name: z.string()
    .min(3, { message: "Configuration name must be at least 3 characters long." })
    .max(100, { message: "Configuration name must be no more than 100 characters long." })
    .describe("A user-friendly name for this LLM provider configuration."),

  providerId: z.string()
    .min(2, { message: "Provider ID must be at least 2 characters long." })
    .max(50, { message: "Provider ID must be no more than 50 characters long." })
    .regex(/^[a-z0-9-]+$/, { message: "Provider ID can only contain lowercase letters, numbers, and hyphens."})
    .describe("Identifier for the LLM provider (e.g., 'openai', 'anthropic', 'google-gemini')."),

  apiKey: z.string()
    .min(10, { message: "API key seems too short." })
    // No max length, as API keys can vary greatly. Specific validation might occur at the adapter level.
    .describe("The API key for accessing the LLM provider's services."),

  baseUrl: z.string()
    .url({ message: "Base URL must be a valid URL." })
    .optional()
    .nullable() // Allows explicit null if the provider doesn't use a separate base URL (e.g., for some local models)
    .describe("Optional custom base URL for the LLM provider API (e.g., for proxies or self-hosted models)."),

  // Future considerations:
  // defaultModelId: z.string().optional().describe("Default model to use with this configuration."),
  // otherParams: z.record(z.any()).optional().describe("Provider-specific additional parameters."),
}).strict();

export type CreateLLMProviderConfigUseCaseInput = z.infer<typeof CreateLLMProviderConfigUseCaseInputSchema>;

/**
 * Output schema for CreateLLMProviderConfigUseCase.
 */
export const CreateLLMProviderConfigUseCaseOutputSchema = z.object({
  llmProviderConfigId: z.string().uuid().describe("The unique identifier of the newly created LLM provider configuration."),
});

export type CreateLLMProviderConfigUseCaseOutput = z.infer<typeof CreateLLMProviderConfigUseCaseOutputSchema>;
