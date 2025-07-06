// src/core/application/use-cases/agent-internal-state/load-agent-internal-state.schema.ts
import { z } from "zod";

/**
 * Input schema for LoadAgentInternalStateUseCase.
 */
export const LoadAgentInternalStateUseCaseInputSchema = z
  .object({
    agentId: z
      .string()
      .uuid({ message: "Agent ID must be a valid UUID." })
      .describe("The ID of the agent whose internal state is to be loaded."),
  })
  .strict();

export type LoadAgentInternalStateUseCaseInput = z.infer<
  typeof LoadAgentInternalStateUseCaseInputSchema
>;

/**
 * Output schema for LoadAgentInternalStateUseCase.
 * Represents the structure of the agent's internal state.
 */
export const LoadAgentInternalStateUseCaseOutputSchema = z.object({
  agentId: z.string().uuid().describe("The ID of the agent."),

  currentProjectId: z
    .string()
    .uuid()
    .nullable()
    .describe(
      "ID of the project the agent is currently focused on, or null if none."
    ),

  // CurrentGoal VO allows empty string, DTO represents as string or null.
  currentGoal: z
    .string()
    .nullable()
    .describe("Current goal or task the agent is working on, or null if none."),

  generalNotes: z
    .array(z.string())
    .describe("Array of general notes. Each string is a note."),

  // AgentInternalState entity currently does not have createdAt/updatedAt.
  // If they were added, they would be here:
  // createdAt: z.string().datetime().describe("Timestamp of state creation."),
  // updatedAt: z.string().datetime().describe("Timestamp of last state update."),
});

export type LoadAgentInternalStateUseCaseOutput = z.infer<
  typeof LoadAgentInternalStateUseCaseOutputSchema
>;
