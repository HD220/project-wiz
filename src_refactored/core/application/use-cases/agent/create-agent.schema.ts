// src_refactored/core/application/use-cases/agent/create-agent.schema.ts
import { z } from 'zod';

/**
 * Input schema for CreateAgentUseCase.
 */
export const CreateAgentUseCaseInputSchema = z.object({
  personaTemplateId: z.string().uuid({
    message: "Persona Template ID must be a valid UUID.",
  }).describe("The ID of the AgentPersonaTemplate to use for this agent."),

  llmProviderConfigId: z.string().uuid({
    message: "LLM Provider Config ID must be a valid UUID.",
  }).describe("The ID of the LLMProviderConfig to use for this agent."),

  temperature: z.number()
    .min(0.0, { message: "Temperature must be at least 0.0." })
    .max(2.0, { message: "Temperature must be no more than 2.0." })
    .optional()
    .describe("Optional temperature setting for the agent's LLM. Defaults to a standard value if not provided (e.g., 0.7)."),

  // customName: z.string().min(1).max(100).optional().describe("Optional custom name for this agent instance."),
}).strict();

export type CreateAgentUseCaseInput = z.infer<typeof CreateAgentUseCaseInputSchema>;

/**
 * Output schema for CreateAgentUseCase.
 */
export const CreateAgentUseCaseOutputSchema = z.object({
  agentId: z.string().uuid().describe("The unique identifier of the newly created agent."),
});

export type CreateAgentUseCaseOutput = z.infer<typeof CreateAgentUseCaseOutputSchema>;
