// src_refactored/core/application/use-cases/annotation/save-annotation.schema.ts
import { z } from 'zod';

/**
 * Input schema for SaveAnnotationUseCase.
 * Used for both creating a new annotation and updating an existing one.
 */
export const SaveAnnotationUseCaseInputSchema = z.object({
  id: z.string().uuid({ message: "Annotation ID must be a valid UUID if provided." })
    .optional()
    .describe("Optional ID of the annotation to update. If omitted, a new annotation will be created."),

  text: z.string()
    .trim()
    .min(1, { message: "Annotation text cannot be empty." })
    .max(5000, { message: "Annotation text must be no more than 5000 characters long." }) // Aligned with AnnotationText VO
    .describe("The content of the annotation."),

  agentId: z.string().uuid({ message: "Agent ID must be a valid UUID if provided." })
    .optional()
    .nullable() // Allow explicitly unsetting or not providing
    .describe("Optional ID of the agent associated with this annotation."),

  jobId: z.string().uuid({ message: "Job ID must be a valid UUID if provided." })
    .optional()
    .nullable() // Allow explicitly unsetting or not providing
    .describe("Optional ID of the job this annotation is related to."),
}).strict();

export type SaveAnnotationUseCaseInput = z.infer<typeof SaveAnnotationUseCaseInputSchema>;

/**
 * Output schema for SaveAnnotationUseCase.
 */
export const SaveAnnotationUseCaseOutputSchema = z.object({
  annotationId: z.string().uuid().describe("The ID of the saved (created or updated) annotation."),
  createdAt: z.string().datetime().describe("The ISO 8601 date and time when the annotation was created."),
  updatedAt: z.string().datetime().describe("The ISO 8601 date and time when the annotation was last updated."),
});

export type SaveAnnotationUseCaseOutput = z.infer<typeof SaveAnnotationUseCaseOutputSchema>;
