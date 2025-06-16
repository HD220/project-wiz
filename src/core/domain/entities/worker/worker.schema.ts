import { z } from "zod";
import { WorkerId } from "./value-objects/worker-id.vo";
import { WorkerStatus } from "./value-objects/worker-status.vo";

export const workerSchema = z.object({
  id: z.instanceof(WorkerId),
  name: z.string().min(1),
  status: z.instanceof(WorkerStatus),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});
