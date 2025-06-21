import { z } from "zod";
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo";
import { WorkerId } from "../../domain/entities/worker/value-objects/worker-id.vo"; // Added import

export const ProcessJobSchema = z.object({
  jobId: z.instanceof(JobId),
  workerId: z.instanceof(WorkerId), // Changed
});

export type ProcessJobInput = z.infer<typeof ProcessJobSchema>;
