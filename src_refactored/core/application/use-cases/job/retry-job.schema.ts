// src_refactored/core/application/use-cases/job/retry-job.schema.ts
import { z } from 'zod';

import { JobStatusType } from '@/domain/job/value-objects/job-status.vo';

/**
 * Input schema for RetryJobUseCase.
 */
export const RetryJobUseCaseInputSchema = z.object({
  jobId: z.string().uuid({ message: "Job ID must be a valid UUID." })
    .describe("The ID of the job to retry."),
  // Optional: forceRetry even if not normally retryable (use with caution)
  // forceRetry: z.boolean().optional().describe("If true, attempts to retry the job even if it's not in a FAILED state or has exhausted retries. Use with caution."),
}).strict();

export type RetryJobUseCaseInput = z.infer<typeof RetryJobUseCaseInputSchema>;

/**
 * Output schema for RetryJobUseCase.
 */
export const RetryJobUseCaseOutputSchema = z.object({
  success: z.boolean().describe("Indicates whether the retry was successfully initiated."),
  jobId: z.string().uuid().describe("The ID of the job that was attempted to be retried."),
  newStatus: z.nativeEnum(JobStatusType).describe("The new status of the job after the retry attempt (e.g., PENDING, DELAYED)."),
  executeAfter: z.string().datetime({ message: "Execute after must be a valid ISO 8601 datetime string." }).nullable()
    .describe("The ISO 8601 timestamp for when the job is next scheduled to run, or null if immediate."),
  message: z.string().optional().describe("Optional message providing more context about the retry operation (e.g., 'Max retries reached', 'Job not in a retryable state').")
});

export type RetryJobUseCaseOutput = z.infer<typeof RetryJobUseCaseOutputSchema>;
