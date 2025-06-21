import { z } from 'zod';
// Importe jobStatusSchema de '../../domain/entities/job/value-objects/job-status.vo'
import { jobStatusSchema } from '../../../domain/entities/job/value-objects/job-status.vo';


export const ExecuteTaskInputSchema = z.object({
    agentId: z.string().uuid("Agent ID must be a valid UUID."),
    jobId: z.string().uuid("Job ID must be a valid UUID."),
});
export type ExecuteTaskUseCaseInput = z.infer<typeof ExecuteTaskInputSchema>;

export const ExecuteTaskOutputSchema = z.object({
    jobId: z.string().uuid(),
    jobStatus: jobStatusSchema, // O enum Zod de JobStatusType
    taskOutput: z.any().optional(), // Pode ser qualquer tipo de dado ou string
});
export type ExecuteTaskUseCaseOutput = z.infer<typeof ExecuteTaskOutputSchema>;
