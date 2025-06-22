// src_refactored/core/application/use-cases/annotation/remove-annotation.schema.ts
import { z } from 'zod';

/**
 * Input schema for RemoveAnnotationUseCase.
 */
export const RemoveAnnotationUseCaseInputSchema = z.object({
  annotationId: z.string().uuid({ message: "Annotation ID must be a valid UUID." })
    .describe("The ID of the annotation to remove."),
}).strict();

export type RemoveAnnotationUseCaseInput = z.infer<typeof RemoveAnnotationUseCaseInputSchema>;

/**
 * Output schema for RemoveAnnotationUseCase.
 */
export const RemoveAnnotationUseCaseOutputSchema = z.object({
  success: z.boolean().describe("Indicates whether the removal was successful (i.e., annotation found and deleted)."),
  annotationId: z.string().uuid().describe("The ID of the annotation that was attempted to be removed."),
});

export type RemoveAnnotationUseCaseOutput = z.infer<typeof RemoveAnnotationUseCaseOutputSchema>;
