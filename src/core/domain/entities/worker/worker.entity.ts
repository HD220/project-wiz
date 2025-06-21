import { WorkerId } from "./value-objects/worker-id.vo";
import { WorkerStatus } from "./value-objects/worker-status.vo";
import { workerSchema } from "./worker.schema";
import { WorkerName } from "./value-objects/worker-name.vo"; // New VO
import { JobTimestamp } from "../job/value-objects/job-timestamp.vo"; // Reused VO
import { DomainError } from "@/core/common/errors";

// Updated WorkerProps
type WorkerProps = {
  id: WorkerId;
  name: WorkerName; // Changed
  status: WorkerStatus;
  createdAt: JobTimestamp; // Changed
  updatedAt?: JobTimestamp; // Changed
};

// TODO: OBJECT_CALISTHENICS_REFACTOR: This class is undergoing refactoring.
// The `getProps()` method is a temporary measure for external consumers.
// Ideally, direct state access will be replaced by more behavior-oriented methods.
export class Worker {
  constructor(private readonly fields: WorkerProps) {
    if (!fields.id || !fields.name || !fields.status || !fields.createdAt) {
      throw new DomainError("Worker ID, Name, Status, and CreatedAt are mandatory.");
    }
    // Schema validation needs to be adjusted for VOs
    // workerSchema.parse(fields); // TODO: Update workerSchema for VOs
  }

  public id(): WorkerId {
    return this.fields.id;
  }

  public getProps(): Readonly<WorkerProps> {
    return { ...this.fields };
  }

  // Individual getters removed: name, status, createdAt, updatedAt

  allocateToJob(timestamp: JobTimestamp): Worker { // Added timestamp parameter
    return new WorkerBuilder(this.fields)
      .withStatus(WorkerStatus.createBusy())
      .withUpdatedAt(timestamp) // Use provided timestamp
      .build();
  }

  release(timestamp: JobTimestamp): Worker { // Added timestamp parameter
    return new WorkerBuilder(this.fields)
      .withStatus(WorkerStatus.createAvailable())
      .withUpdatedAt(timestamp) // Use provided timestamp
      .build();
  }

  isAvailable(): boolean {
    return this.fields.status.isAvailable(); // Use new method on WorkerStatus VO
  }

  public equals(other?: Worker): boolean {
    if (this === other) return true;
    if (!other || !(other instanceof Worker)) return false;

    const sameTimestamps = this.fields.updatedAt && other.fields.updatedAt
      ? this.fields.updatedAt.equals(other.fields.updatedAt)
      : this.fields.updatedAt === other.fields.updatedAt; // Both undefined or one is undefined

    return (
      this.fields.id.equals(other.fields.id) &&
      this.fields.name.equals(other.fields.name) &&
      this.fields.status.equals(other.fields.status) &&
      this.fields.createdAt.equals(other.fields.createdAt) &&
      sameTimestamps
    );
  }
}

export class WorkerBuilder {
  private fields: Partial<WorkerProps>;

  constructor(fields?: Partial<WorkerProps>) {
    this.fields = fields ? { ...fields } : {};
    if (!this.fields.status) {
      this.fields.status = WorkerStatus.createAvailable(); // Default to available
    }
    if (!this.fields.createdAt) {
      this.fields.createdAt = JobTimestamp.now(); // Default to now
    }
  }

  withId(id: WorkerId): WorkerBuilder {
    this.fields.id = id;
    return this;
  }

  withName(name: string): WorkerBuilder { // Accepts primitive
    this.fields.name = WorkerName.create(name); // Creates VO
    return this;
  }

  withStatus(status: WorkerStatus): WorkerBuilder {
    this.fields.status = status;
    return this;
  }

  withCreatedAt(createdAt: Date): WorkerBuilder { // Accepts primitive
    this.fields.createdAt = JobTimestamp.create(createdAt); // Creates VO
    return this;
  }

  withUpdatedAt(updatedAt: Date): WorkerBuilder { // Accepts primitive
    this.fields.updatedAt = JobTimestamp.create(updatedAt); // Creates VO
    return this;
  }

  build(): Worker {
    if (!this.fields.id) {
      throw new DomainError("Worker ID is required to build a Worker.");
    }
    if (!this.fields.name) {
      throw new DomainError("Worker Name is required to build a Worker.");
    }
    // Status and CreatedAt are defaulted by constructor.

    return new Worker({
      id: this.fields.id as WorkerId,
      name: this.fields.name as WorkerName,
      status: this.fields.status as WorkerStatus,
      createdAt: this.fields.createdAt as JobTimestamp,
      updatedAt: this.fields.updatedAt, // Already JobTimestamp | undefined
    });
  }
}
