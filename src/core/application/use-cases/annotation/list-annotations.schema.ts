// src/core/application/use-cases/annotation/list-annotations.schema.ts
import { z } from "zod";

/**
 * Input schema for ListAnnotationsUseCase, allowing filtering and pagination.
 */
export const ListAnnotationsUseCaseInputSchema = z
  .object({
    agentId: z
      .string()
      .uuid({ message: "Agent ID must be a valid UUID if provided." })
      .optional()
      .nullable()
      .describe("Optional Agent ID to filter annotations by."),

    jobId: z
      .string()
      .uuid({ message: "Job ID must be a valid UUID if provided." })
      .optional()
      .nullable()
      .describe("Optional Job ID to filter annotations by."),

    // TODO: Consider text search filter, date range filters.

    page: z
      .number()
      .int({ message: "Page number must be an integer." })
      .positive({ message: "Page number must be positive." })
      .optional()
      .default(1)
      .describe("Page number for pagination, 1-indexed."),

    pageSize: z
      .number()
      .int({ message: "Page size must be an integer." })
      .positive({ message: "Page size must be positive." })
      .max(100, { message: "Page size cannot exceed 100." })
      .optional()
      .default(20)
      .describe("Number of annotations per page for pagination."),
  })
  .strict();

export type ListAnnotationsUseCaseInput = z.infer<
  typeof ListAnnotationsUseCaseInputSchema
>;

/**
 * Schema for a single annotation item in the list output.
 */
export const AnnotationListItemSchema = z.object({
  id: z.string().uuid().describe("Annotation ID."),
  text: z.string().describe("Full text content of the annotation."),
  // Consider adding a truncated 'excerpt' or 'summary' field if needed for UI previews.
  agentId: z
    .string()
    .uuid()
    .nullable()
    .describe("Associated Agent ID, or null."),
  jobId: z.string().uuid().nullable().describe("Associated Job ID, or null."),
  createdAt: z.string().datetime().describe("Creation timestamp."),
  updatedAt: z.string().datetime().describe("Last update timestamp."),
});

export type AnnotationListItem = z.infer<typeof AnnotationListItemSchema>;

/**
 * Output schema for ListAnnotationsUseCase, including pagination details.
 */
export const ListAnnotationsUseCaseOutputSchema = z.object({
  annotations: z
    .array(AnnotationListItemSchema)
    .describe("Array of annotation list items for the current page."),
  totalCount: z
    .number()
    .int()
    .describe("Total number of annotations matching the filters."),
  page: z.number().int().describe("Current page number."),
  pageSize: z.number().int().describe("Number of annotations per page."),
  totalPages: z.number().int().describe("Total number of pages."),
});

export type ListAnnotationsUseCaseOutput = z.infer<
  typeof ListAnnotationsUseCaseOutputSchema
>;
