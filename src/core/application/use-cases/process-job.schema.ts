import { z } from "zod";
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo";

export const ProcessJobSchema = z.object({
  jobId: z.instanceof(JobId),
  workerId: z.string().uuid(),
});

export type ProcessJobInput = z.infer<typeof ProcessJobSchema>;
