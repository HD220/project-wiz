// src/core/application/use-cases/project/create-project.schema.ts
import { z } from "zod";

export const CreateProjectInputSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Project name cannot be empty." })
    .max(100),
  description: z.string().max(500).optional(),
  // path (working directory) will be derived from ProjectId by the use case
});

export type CreateProjectUseCaseInput = z.infer<
  typeof CreateProjectInputSchema
>;

export const CreateProjectOutputSchema = z.object({
  projectId: z.string().uuid(),
  // Could also return project name, paths created, etc.
});

export type CreateProjectUseCaseOutput = z.infer<
  typeof CreateProjectOutputSchema
>;
