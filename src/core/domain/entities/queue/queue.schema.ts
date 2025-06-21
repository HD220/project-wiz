import { z } from "zod";
import { QueueId } from "./value-objects/queue-id.vo";
import { QueueStatus } from "./value-objects/queue-status.vo";
import { QueueName } from "./value-objects/queue-name.vo"; // Added import
import { JobTimestamp } from "../job/value-objects/job-timestamp.vo"; // Added import

export const queueSchema = z.object({
  id: z.instanceof(QueueId),
  name: z.instanceof(QueueName), // Changed
  status: z.instanceof(QueueStatus),
  createdAt: z.instanceof(JobTimestamp), // Changed
  updatedAt: z.instanceof(JobTimestamp).optional(), // Changed
});
