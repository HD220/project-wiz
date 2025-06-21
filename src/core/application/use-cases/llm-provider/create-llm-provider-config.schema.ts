import { z } from 'zod';

export const CreateLLMProviderConfigInputSchema = z.object({
    name: z.string().min(1, "Configuration name cannot be empty."),
    apiKey: z.string().min(1, "API key cannot be empty."),
    llmProviderId: z.string().uuid("LLM Provider ID must be a valid UUID."),
    modelId: z.string().min(1, "Model ID cannot be empty."), // Model ID can be a string like 'gpt-4' or a slug
});
export type CreateLLMProviderConfigUseCaseInput = z.infer<typeof CreateLLMProviderConfigInputSchema>;

export const CreateLLMProviderConfigOutputSchema = z.object({
    llmProviderConfigId: z.string().uuid(),
});
export type CreateLLMProviderConfigUseCaseOutput = z.infer<typeof CreateLLMProviderConfigOutputSchema>;
