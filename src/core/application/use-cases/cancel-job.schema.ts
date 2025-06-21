import { z } from "zod";
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo";
import {
  JobStatus,
  jobStatusSchema,
} from "../../domain/entities/job/value-objects/job-status.vo";

export const CancelJobInputSchema = z.object({
  id: z.instanceof(JobId, {
    message: "ID do job deve ser uma instância válida de JobId",
  }),
});

export type CancelJobUseCaseInput = z.infer<typeof CancelJobInputSchema>;

export const CancelJobOutputSchema = z.object({
  id: z.string().uuid(), // Changed to primitive
  status: jobStatusSchema, // Use the Zod enum directly for primitive status string
  updatedAt: z.date(),   // Primitive
});

export type CancelJobUseCaseOutput = z.infer<typeof CancelJobOutputSchema>;
