import { z } from "zod";

const queueStatusSchema = z.enum(["ACTIVE", "PAUSED", "DRAINING"]);

export type QueueStatusType = z.infer<typeof queueStatusSchema>;

export class QueueStatus {
  constructor(private readonly status: QueueStatusType) {
    queueStatusSchema.parse(status);
  }

  get value(): QueueStatusType {
    return this.status;
  }
}
