// src/core/application/use-cases/project/create-project.schema.ts
import { z } from 'zod';

export const CreateProjectInputSchema = z.object({
    name: z.string().min(1, "Project name cannot be empty."),
    description: z.string().optional(),
});
export type CreateProjectUseCaseInput = z.infer<typeof CreateProjectInputSchema>;

export const CreateProjectOutputSchema = z.object({
    projectId: z.string().uuid(),
});
export type CreateProjectUseCaseOutput = z.infer<typeof CreateProjectOutputSchema>;
