export type WorkerStatusValue = 'idle' | 'busy' | 'offline' | 'error';
const VALID_WORKER_STATUSES: ReadonlyArray<WorkerStatusValue> = ['idle', 'busy', 'offline', 'error'];

export class WorkerStatus {
  private readonly value: WorkerStatusValue;
  private constructor(status: WorkerStatusValue) {
    if (!VALID_WORKER_STATUSES.includes(status)) {
      throw new Error(`Invalid worker status: ${status}`);
    }
    this.value = status;
  }
  public static create(status: WorkerStatusValue): WorkerStatus { return new WorkerStatus(status); }
  public static idle(): WorkerStatus { return new WorkerStatus('idle'); }
  public static busy(): WorkerStatus { return new WorkerStatus('busy'); }
  public static offline(): WorkerStatus { return new WorkerStatus('offline'); }
  public static error(): WorkerStatus { return new WorkerStatus('error'); }
  public getValue(): WorkerStatusValue { return this.value; }
  public equals(other: WorkerStatus): boolean { return this.value === other.getValue(); }
  public isIdle(): boolean { return this.value === 'idle'; }
  public isBusy(): boolean { return this.value === 'busy'; }
}
