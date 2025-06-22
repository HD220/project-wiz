// src_refactored/core/application/use-cases/job/list-jobs.schema.ts
import { z } from 'zod';
import { JobStatusType } from '../../../../core/domain/job/value-objects/job-status.vo';

/**
 * Input schema for ListJobsUseCase, allowing filtering and pagination.
 */
export const ListJobsUseCaseInputSchema = z.object({
  status: z.array(z.nativeEnum(JobStatusType))
    .optional()
    .describe("Optional array of job statuses to filter by."),

  targetAgentRole: z.string()
    .trim()
    .min(1)
    .optional()
    .describe("Optional target agent role to filter by."),

  nameContains: z.string()
    .trim()
    .min(1)
    .optional()
    .describe("Optional text to search within job names."),

  // TODO: Consider date range filters for createdAt or updatedAt

  page: z.number()
    .int({ message: "Page number must be an integer." })
    .positive({ message: "Page number must be positive." })
    .optional()
    .default(1)
    .describe("Page number for pagination, 1-indexed."),

  pageSize: z.number()
    .int({ message: "Page size must be an integer." })
    .positive({ message: "Page size must be positive." })
    .max(100, { message: "Page size cannot exceed 100." })
    .optional()
    .default(20)
    .describe("Number of jobs per page for pagination."),
}).strict();

export type ListJobsUseCaseInput = z.infer<typeof ListJobsUseCaseInputSchema>;

/**
 * Schema for a single job item in the list output.
 */
export const JobListItemSchema = z.object({
  id: z.string().uuid().describe("Job ID."),
  name: z.string().describe("Job name."),
  status: z.nativeEnum(JobStatusType).describe("Current status of the job."),
  targetAgentRole: z.string().nullable().describe("Target agent role, or null if not set."),
  priority: z.number().int().describe("Job priority."),
  createdAt: z.string().datetime().describe("Creation timestamp."),
  updatedAt: z.string().datetime().describe("Last update timestamp."),
  executeAfter: z.string().datetime().nullable().describe("Scheduled execution time, or null if not set."),
  // Consider adding attemptCount if useful for UI:
  // attemptCount: z.number().int().describe("Number of execution attempts."),
});

export type JobListItem = z.infer<typeof JobListItemSchema>;

/**
 * Output schema for ListJobsUseCase, including pagination details.
 */
export const ListJobsUseCaseOutputSchema = z.object({
  jobs: z.array(JobListItemSchema).describe("Array of job list items for the current page."),
  totalCount: z.number().int().describe("Total number of jobs matching the filters."),
  page: z.number().int().describe("Current page number."),
  pageSize: z.number().int().describe("Number of jobs per page."),
  totalPages: z.number().int().describe("Total number of pages."),
});

export type ListJobsUseCaseOutput = z.infer<typeof ListJobsUseCaseOutputSchema>;
