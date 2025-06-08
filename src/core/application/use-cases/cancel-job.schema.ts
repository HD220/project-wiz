import { z } from "zod";
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo";
import { JobStatus } from "../../domain/entities/job/value-objects/job-status.vo";

export const CancelJobInputSchema = z.object({
  id: z.instanceof(JobId, {
    message: "ID do job deve ser uma instância válida de JobId",
  }),
});

export type CancelJobUseCaseInput = z.infer<typeof CancelJobInputSchema>;

export const CancelJobOutputSchema = z.object({
  id: z.instanceof(JobId),
  status: z.instanceof(JobStatus),
  updatedAt: z.date(),
});

export type CancelJobUseCaseOutput = z.infer<typeof CancelJobOutputSchema>;
