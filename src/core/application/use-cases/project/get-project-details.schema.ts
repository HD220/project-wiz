// src/core/application/use-cases/project/get-project-details.schema.ts
import { z } from "zod";

/**
 * Input schema for GetProjectDetailsUseCase.
 * Requires the ID of the project to fetch.
 */
export const GetProjectDetailsUseCaseInputSchema = z
  .object({
    projectId: z.string().uuid({ message: "Project ID must be a valid UUID." }),
  })
  .strict();

export type GetProjectDetailsUseCaseInput = z.infer<
  typeof GetProjectDetailsUseCaseInputSchema
>;

/**
 * Schema for the source code details part of the output.
 */
export const SourceCodeDetailsSchema = z.object({
  id: z
    .string()
    .uuid()
    .describe("The unique identifier of the source code entry."),
  repositoryPath: z
    .string()
    .describe("The file system path to the project's source code repository."),
  // docsPath can be undefined in the SourceCode entity, so it's nullable in the DTO.
  docsPath: z
    .string()
    .nullable()
    .describe(
      "The file system path to the project's documentation, or null if not set."
    ),
});

export type SourceCodeDetails = z.infer<typeof SourceCodeDetailsSchema>;

/**
 * Output schema for GetProjectDetailsUseCase.
 * Returns detailed information about a project, including its source code details.
 */
export const GetProjectDetailsUseCaseOutputSchema = z.object({
  id: z.string().uuid().describe("The unique identifier of the project."),
  name: z.string().describe("The name of the project."),
  // ProjectDescription VO always holds a string, and Project entity requires it.
  description: z
    .string()
    .nullable()
    .describe("The description of the project."),
  createdAt: z
    .string()
    .datetime()
    .describe("The ISO 8601 date and time when the project was created."),
  updatedAt: z
    .string()
    .datetime()
    .describe("The ISO 8601 date and time when the project was last updated."),
  // SourceCode might not exist for a project, or could be disassociated.
  sourceCode: SourceCodeDetailsSchema.nullable().describe(
    "Details of the project's source code, or null if not available."
  ),
});

export type GetProjectDetailsUseCaseOutput = z.infer<
  typeof GetProjectDetailsUseCaseOutputSchema
>;
