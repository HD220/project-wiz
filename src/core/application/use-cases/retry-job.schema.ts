import { z } from 'zod';
import { JobId } from '../../domain/entities/job/value-objects/job-id.vo';
import { jobStatusSchema } from '../../domain/entities/job/value-objects/job-status.vo'; // Zod enum for JobStatusType

export const RetryJobInputSchema = z.object({
    jobId: z.instanceof(JobId),
});
export type RetryJobUseCaseInput = z.infer<typeof RetryJobInputSchema>;

export const RetryJobOutputSchema = z.object({
    jobId: z.string().uuid(),
    attempts: z.number().int().min(0), // Min is actually 1 after a retry attempt
    status: jobStatusSchema, // The Zod enum for JobStatusType
    nextAttemptAt: z.date().optional(),
});
export type RetryJobUseCaseOutput = z.infer<typeof RetryJobOutputSchema>;
