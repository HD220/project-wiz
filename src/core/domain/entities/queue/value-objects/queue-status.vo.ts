import { z } from "zod";

const queueStatusSchema = z.enum(["ACTIVE", "PAUSED", "DRAINING"]);

export type QueueStatusType = z.infer<typeof queueStatusSchema>;

export class QueueStatus {
  private constructor(private readonly _status: QueueStatusType) {
    // Validation is ensured by the static create methods using the schema.
  }

  public static create(status: QueueStatusType): QueueStatus {
    queueStatusSchema.parse(status); // Validate input against the enum
    return new QueueStatus(status);
  }

  public static createActive(): QueueStatus {
    return new QueueStatus("ACTIVE");
  }

  public static createPaused(): QueueStatus {
    return new QueueStatus("PAUSED");
  }

  public static createDraining(): QueueStatus {
    return new QueueStatus("DRAINING");
  }

  public getValue(): QueueStatusType {
    return this._status;
  }

  public equals(other?: QueueStatus): boolean {
    return !!other && this._status === other._status;
  }

  public isActive(): boolean {
    return this._status === "ACTIVE";
  }

  public isPaused(): boolean {
    return this._status === "PAUSED";
  }

  public isDraining(): boolean {
    return this._status === "DRAINING";
  }
}
