// src_refactored/core/application/use-cases/project/list-projects.schema.ts
import { z } from 'zod';

/**
 * Input schema for ListProjectsUseCase.
 * Currently, no specific input parameters are defined for a simple list.
 * This can be extended later with pagination, filtering, or sorting options.
 */
export const ListProjectsUseCaseInputSchema = z.object({
  // Example for future pagination:
  // limit: z.number().int().positive().optional(),
  // offset: z.number().int().nonnegative().optional(),
}).strict(); // Use .strict() to prevent unknown keys

export type ListProjectsUseCaseInput = z.infer<typeof ListProjectsUseCaseInputSchema>;

/**
 * Schema for a single project item in the output list.
 */
export const ProjectListItemSchema = z.object({
  id: z.string().uuid().describe('The unique identifier of the project.'),
  name: z.string().describe('The name of the project.'),
  createdAt: z.string().datetime().describe('The ISO 8601 date and time when the project was created.'),
  // Add other summary fields if necessary, e.g., description, lastModifiedAt
});

export type ProjectListItem = z.infer<typeof ProjectListItemSchema>;

/**
 * Output schema for ListProjectsUseCase.
 * Returns an array of project list items.
 */
export const ListProjectsUseCaseOutputSchema = z.array(ProjectListItemSchema);

export type ListProjectsUseCaseOutput = z.infer<typeof ListProjectsUseCaseOutputSchema>;
