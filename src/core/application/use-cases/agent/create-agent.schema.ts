import { z } from 'zod';

export const CreateAgentInputSchema = z.object({
    personaId: z.string().uuid("Persona ID must be a valid UUID."),
    llmProviderConfigId: z.string().uuid("LLM Provider Config ID must be a valid UUID."),
    temperature: z.number().min(0).max(2, "Temperature must be between 0 and 2 (inclusive)."),
});
export type CreateAgentUseCaseInput = z.infer<typeof CreateAgentInputSchema>;

export const CreateAgentOutputSchema = z.object({
    agentId: z.string().uuid(),
});
export type CreateAgentUseCaseOutput = z.infer<typeof CreateAgentOutputSchema>;
