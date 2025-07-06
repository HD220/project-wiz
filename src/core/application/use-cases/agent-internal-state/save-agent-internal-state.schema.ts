// src/core/application/use-cases/agent-internal-state/save-agent-internal-state.schema.ts
import { z } from "zod";

/**
 * Input schema for SaveAgentInternalStateUseCase.
 * All fields are optional as saving state might involve updating only parts of it,
 * or creating it for the first time. The use case will handle merging.
 */
export const SaveAgentInternalStateUseCaseInputSchema = z
  .object({
    agentId: z
      .string()
      .uuid({ message: "Agent ID must be a valid UUID." })
      .describe("The ID of the agent whose internal state is being saved."),

    currentProjectId: z
      .string()
      .uuid({ message: "Current Project ID must be a valid UUID if provided." })
      .optional()
      .nullable()
      .describe(
        "Optional ID of the project the agent is currently focused on. Null to clear."
      ),

    currentGoal: z
      .string()
      .max(500, {
        message: "Current goal must be no more than 500 characters long.",
      })
      // Allowing empty string as CurrentGoal VO permits it.
      .optional()
      .nullable()
      .describe(
        "Optional current goal or task the agent is working on. Null or empty to clear."
      ),

    // Based on GeneralNotesCollection.create(string[]), each string is a note.
    // NoteEntry (internal to GeneralNotesCollection) validates min(1) and max(2000) for each note.
    generalNotes: z
      .array(
        z
          .string()
          .trim()
          .min(1, { message: "Individual general note text cannot be empty." })
          .max(2000, {
            message:
              "Individual general note text must be no more than 2000 characters.",
          })
      )
      .optional()
      // If .nullable() is added, it means the entire array can be null.
      // If not, an empty array [] should be passed to clear notes, or the field omitted to not change notes.
      // The AgentInternalState.create() handles undefined generalNotes as empty array.
      .describe(
        "Optional array of general notes. Each string is a note. Send empty array to clear all notes, or omit to leave existing notes untouched (use case logic dependent)."
      ),
  })
  .strict();

export type SaveAgentInternalStateUseCaseInput = z.infer<
  typeof SaveAgentInternalStateUseCaseInputSchema
>;

/**
 * Output schema for SaveAgentInternalStateUseCase.
 */
export const SaveAgentInternalStateUseCaseOutputSchema = z.object({
  success: z
    .boolean()
    .describe("Indicates whether the save operation was successful."),
  // Optionally, could return the saved state or its updatedAt timestamp.
  // agentId: z.string().uuid(),
  // updatedAt: z.string().datetime(),
});

export type SaveAgentInternalStateUseCaseOutput = z.infer<
  typeof SaveAgentInternalStateUseCaseOutputSchema
>;
