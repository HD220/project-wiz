// src_refactored/core/application/use-cases/job/create-job.schema.ts
import { z } from 'zod';

// import { BackoffType } from '@/domain/job/value-objects/retry-policy.vo'; // Import enum - Path will be fixed

/**
 * Input schema for CreateJobUseCase.
 */
export const CreateJobUseCaseInputSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Job name must be at least 1 character long." })
    .max(150, { message: "Job name must be no more than 150 characters long." })
    .regex(/^[a-zA-Z0-9_-\s]+$/, { message: "Job name contains invalid characters. Allowed: letters, numbers, underscores, hyphens, spaces." })
    .describe("A descriptive name for the job."),

  targetAgentRole: z.string()
    .trim()
    .min(1, { message: "Target agent role cannot be empty."})
    .max(50, { message: "Target agent role must be no more than 50 characters long." })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Target agent role has an invalid format. Must be alphanumeric or underscores."})
    .describe("The role of the agent that should process this job (e.g., 'CodeGenerator', 'DocumentationWriter')."),

  payload: z.record(z.any())
    .optional()
    .nullable()
    .describe("Optional data/payload specific to the job task, should be JSON serializable."),

  priority: z.number()
    .int({ message: "Priority must be an integer." })
    .nonnegative({ message: "Priority must be a non-negative number." })
    .optional()
    .describe("Optional job priority (e.g., 0-HIGHEST, 10-NORMAL). Lower numbers typically mean higher priority."),

  dependsOnJobIds: z.array(z.string().uuid({ message: "Each dependent job ID must be a valid UUID." }))
    .optional()
    .describe("Optional array of Job IDs that this job depends on. This job will not start until all dependencies are complete."),

  retryPolicy: z.object({
    maxAttempts: z.number()
      .int({ message: "Max attempts must be an integer."})
      .min(0, { message: "Max attempts cannot be negative." }) // 0 or 1 can mean NoRetryPolicy or a single attempt policy
      .max(100, { message: "Max attempts cannot exceed 100."}) // Practical limit
      .optional()
      .describe("Maximum number of attempts for the job. 0 or 1 might imply no retries beyond the first attempt."),
    initialDelaySeconds: z.number()
      .int({ message: "Initial delay must be an integer."})
      .min(0, { message: "Initial delay cannot be negative."})
      .optional()
      .describe("Initial delay in seconds before the first retry. Used for FIXED backoff or as base for EXPONENTIAL."),
    backoffType: z.enum([BackoffType.FIXED, BackoffType.EXPONENTIAL])
      .optional()
      .describe("Backoff strategy for retries: 'FIXED' or 'EXPONENTIAL'."),
    maxDelaySeconds: z.number()
      .int({ message: "Max delay must be an integer."})
      .min(0, { message: "Max delay cannot be negative."})
      .optional()
      .describe("Maximum delay in seconds between retries, for EXPONENTIAL backoff."),
  })
  .optional()
  .describe("Optional retry policy for the job if it fails."),

}).strict();

export type CreateJobUseCaseInput = z.infer<typeof CreateJobUseCaseInputSchema>;

/**
 * Output schema for CreateJobUseCase.
 */
export const CreateJobUseCaseOutputSchema = z.object({
  jobId: z.string().uuid().describe("The unique identifier of the newly created job."),
});

export type CreateJobUseCaseOutput = z.infer<typeof CreateJobUseCaseOutputSchema>;
