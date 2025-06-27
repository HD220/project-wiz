// src_refactored/core/application/use-cases/job/update-job.schema.ts
import { z } from 'zod';

import { BackoffType } from '@/domain/job/value-objects/retry-policy.vo';

/**
 * Input schema for UpdateJobUseCase.
 * All updatable fields are optional.
 */
export const UpdateJobUseCaseInputSchema = z.object({
  jobId: z.string().uuid({ message: "Job ID must be a valid UUID." })
    .describe("The ID of the job to update."),

  name: z.string()
    .trim()
    .min(1, { message: "Job name must be at least 1 character long." })
    .max(150, { message: "Job name must be no more than 150 characters long." })
    .regex(/^[a-zA-Z0-9_-\s]+$/, { message: "Job name contains invalid characters. Allowed: letters, numbers, underscores, hyphens, spaces." })
    .optional()
    .describe("Optional new name for the job."),

  payload: z.record(z.any())
    .optional()
    .nullable() // Allow explicitly setting payload to null
    .describe("Optional new data/payload for the job task, should be JSON serializable. Set to null to clear."),

  priority: z.number()
    .int({ message: "Priority must be an integer." })
    .nonnegative({ message: "Priority must be a non-negative number." })
    .optional()
    .describe("Optional new job priority."),

  targetAgentRole: z.string()
    .trim()
    .min(1, { message: "Target agent role cannot be empty."})
    .max(50, { message: "Target agent role must be no more than 50 characters long." })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Target agent role has an invalid format. Must be alphanumeric or underscores."})
    .optional()
    .describe("Optional new target agent role for the job."),

  retryPolicy: z.object({
    maxAttempts: z.number()
      .int({ message: "Max attempts must be an integer."})
      .min(0, { message: "Max attempts cannot be negative." })
      .max(100, { message: "Max attempts cannot exceed 100."})
      .optional(),
    initialDelaySeconds: z.number()
      .int({ message: "Initial delay must be an integer."})
      .min(0, { message: "Initial delay cannot be negative."})
      .optional(),
    backoffType: z.enum([BackoffType.FIXED, BackoffType.EXPONENTIAL])
      .optional(),
    maxDelaySeconds: z.number()
      .int({ message: "Max delay must be an integer."})
      .min(0, { message: "Max delay cannot be negative."})
      .optional(),
  })
  .optional()
  .describe("Optional new retry policy for the job. All fields within retryPolicy are also optional if the object is provided."),

  // Note: Job status changes are handled by specific use cases (e.g., CancelJob, RetryJob)
  // to enforce valid state transitions and business logic.
  // executeAfter (for delaying) could be a field here if general rescheduling is desired,
  // but it's often tied to retry logic or specific delay actions.

}).strict();

export type UpdateJobUseCaseInput = z.infer<typeof UpdateJobUseCaseInputSchema>;

/**
 * Output schema for UpdateJobUseCase.
 */
export const UpdateJobUseCaseOutputSchema = z.object({
  jobId: z.string().uuid().describe("The ID of the updated job."),
  updatedAt: z.string().datetime().describe("The ISO 8601 date and time when the job was last updated."),
});

export type UpdateJobUseCaseOutput = z.infer<typeof UpdateJobUseCaseOutputSchema>;
