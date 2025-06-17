import { z } from "zod";

const workerStatusSchema = z.enum(["available", "busy", "offline"]);

export type WorkerStatusType = z.infer<typeof workerStatusSchema>;

export class WorkerStatus {
  constructor(private readonly status: WorkerStatusType) {
    workerStatusSchema.parse(status);
  }

  get value(): WorkerStatusType {
    return this.status;
  }

  static available(): WorkerStatus {
    return new WorkerStatus("available");
  }

  static busy(): WorkerStatus {
    return new WorkerStatus("busy");
  }

  static offline(): WorkerStatus {
    return new WorkerStatus("offline");
  }
}
