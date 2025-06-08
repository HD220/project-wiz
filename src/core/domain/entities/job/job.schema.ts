import { z } from "zod";
import { JobId } from "./value-objects/job-id.vo";
import { JobStatus } from "./value-objects/job-status.vo";
import { RetryPolicy } from "./value-objects/retry-policy.vo";

export const jobSchema = z.object({
  id: z.instanceof(JobId),
  name: z.string().min(1),
  status: z.instanceof(JobStatus),
  attempts: z.number().min(0),
  retryPolicy: z.instanceof(RetryPolicy).optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  payload: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});
