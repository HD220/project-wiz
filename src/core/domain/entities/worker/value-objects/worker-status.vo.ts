export type WorkerStatusValue = 'idle' | 'busy' | 'offline' | 'error';
const VALID_WORKER_STATUSES: ReadonlyArray<WorkerStatusValue> = ['idle', 'busy', 'offline', 'error'];

export class WorkerStatus {
  // Changed to private _status
  private constructor(private readonly _status: WorkerStatusType) {
    // Zod validation can be done in a static create method or assumed valid if constructor is private
    // and only called by static factories that ensure valid type.
    workerStatusSchema.parse(_status); // Keep validation if constructor can be called with arbitrary strings
  }

  // getValue method added
  public getValue(): WorkerStatusType {
    return this._status;
  }

  // equals method added
  public equals(other?: WorkerStatus): boolean {
    return !!other && this._status === other._status;
  }

  // Static factory methods renamed and potentially a general create method
  public static create(status: WorkerStatusType): WorkerStatus {
    workerStatusSchema.parse(status); // Ensure the input string is a valid WorkerStatusType
    return new WorkerStatus(status);
  }

  public static createAvailable(): WorkerStatus {
    return new WorkerStatus("available");
  }

  public static createBusy(): WorkerStatus {
    return new WorkerStatus("busy");
  }

  public static createOffline(): WorkerStatus {
    return new WorkerStatus("offline");
  }

  // Behavioral checks
  public isAvailable(): boolean {
    return this._status === "available";
  }

  public isBusy(): boolean {
    return this._status === "busy";
  }

  public isOffline(): boolean {
    return this._status === "offline";
  }
}
