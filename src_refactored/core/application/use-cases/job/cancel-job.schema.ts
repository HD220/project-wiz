// src_refactored/core/application/use-cases/job/cancel-job.schema.ts
import { z } from 'zod';

/**
 * Input schema for CancelJobUseCase.
 */
export const CancelJobUseCaseInputSchema = z.object({
  jobId: z.string().uuid({ message: "Job ID must be a valid UUID." })
    .describe("The ID of the job to cancel."),
  // Optional reason for cancellation, could be logged or stored.
  reason: z.string().max(500, "Cancellation reason too long.").optional()
    .describe("Optional reason for cancelling the job."),
}).strict();

export type CancelJobUseCaseInput = z.infer<typeof CancelJobUseCaseInputSchema>;

/**
 * Output schema for CancelJobUseCase.
 */
export const CancelJobUseCaseOutputSchema = z.object({
  success: z.boolean().describe("Indicates whether the cancellation was successful (e.g., job found and moved to a cancelled state)."),
  jobId: z.string().uuid().describe("The ID of the job that was attempted to be cancelled."),
  finalStatus: z.string().describe("The final status of the job after the cancellation attempt (e.g., 'CANCELLED', or its previous status if cancellation failed or was not applicable)."),
});

export type CancelJobUseCaseOutputSchema = z.infer<typeof CancelJobUseCaseOutputSchema>;
