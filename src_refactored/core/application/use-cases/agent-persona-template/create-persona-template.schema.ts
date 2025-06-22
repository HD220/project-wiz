// src_refactored/core/application/use-cases/agent-persona-template/create-persona-template.schema.ts
import { z } from 'zod';

/**
 * Input schema for CreatePersonaTemplateUseCase.
 * Validations are based on the corresponding Value Objects.
 */
export const CreatePersonaTemplateUseCaseInputSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Persona name must be at least 1 character long." })
    .max(100, { message: "Persona name must be no more than 100 characters long." })
    .describe("The name of the persona template."),

  role: z.string()
    .trim()
    .min(3, { message: "Persona role must be at least 3 characters long." })
    .max(50, { message: "Persona role must be no more than 50 characters long." })
    .describe("The role the persona will play (e.g., 'Software Engineer', 'Product Manager')."),

  goal: z.string()
    .trim()
    .min(10, { message: "Persona goal must be at least 10 characters long." })
    .max(500, { message: "Persona goal must be no more than 500 characters long." })
    .describe("The primary objective or goal of this persona."),

  backstory: z.string()
    .max(2000, { message: "Persona backstory must be no more than 2000 characters long." })
    // Not trimming backstory via Zod to preserve potential formatting, as VO also doesn't trim.
    // An empty string is permissible for backstory if desired.
    .describe("The backstory or context for the persona. Can be an empty string."),

  toolNames: z.array(
      z.string()
        .trim()
        .min(1, { message: "Tool name cannot be empty." })
        // No max length for individual tool names in Zod, VO doesn't specify.
        // Could add regex for format e.g. namespace.action later.
    )
    .max(20, { message: "A persona template can have a maximum of 20 tools."}) // Arbitrary limit for the array size
    .describe("An array of tool names available to this persona (e.g., ['fileSystem.readFile', 'terminal.executeCommand']). Can be empty."),

}).strict();

export type CreatePersonaTemplateUseCaseInput = z.infer<typeof CreatePersonaTemplateUseCaseInputSchema>;

/**
 * Output schema for CreatePersonaTemplateUseCase.
 */
export const CreatePersonaTemplateUseCaseOutputSchema = z.object({
  // AgentPersonaTemplate.id() returns PersonaId, which is an Identity VO.
  personaTemplateId: z.string().uuid().describe("The unique identifier of the newly created persona template."),
});

export type CreatePersonaTemplateUseCaseOutput = z.infer<typeof CreatePersonaTemplateUseCaseOutputSchema>;
