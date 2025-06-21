import { z } from "zod";
import { WorkerId } from "./value-objects/worker-id.vo";
import { WorkerStatus } from "./value-objects/worker-status.vo";
import { WorkerName } from "./value-objects/worker-name.vo"; // Added import
import { JobTimestamp } from "../job/value-objects/job-timestamp.vo"; // Added import

export const workerSchema = z.object({
  id: z.instanceof(WorkerId),
  name: z.instanceof(WorkerName), // Changed
  status: z.instanceof(WorkerStatus),
  createdAt: z.instanceof(JobTimestamp), // Changed
  updatedAt: z.instanceof(JobTimestamp).optional(), // Changed
});
