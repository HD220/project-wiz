import { z } from "zod";
import { QueueId } from "./value-objects/queue-id.vo";
import { QueueStatus } from "./value-objects/queue-status.vo";

export const queueSchema = z.object({
  id: z.instanceof(QueueId),
  name: z.string().min(1),
  status: z.instanceof(QueueStatus),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});
