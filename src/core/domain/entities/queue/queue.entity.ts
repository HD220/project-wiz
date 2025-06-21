import { QueueId } from "./value-objects/queue-id.vo";
import { QueueStatus } from "./value-objects/queue-status.vo";
import { queueSchema } from "./queue.schema";
import { QueueName } from "./value-objects/queue-name.vo"; // New VO
import { JobTimestamp } from "../job/value-objects/job-timestamp.vo"; // Reused VO
import { DomainError } from "@/core/common/errors";

// Updated QueueProps
type QueueProps = {
  id: QueueId;
  name: QueueName; // Changed
  status: QueueStatus;
  createdAt: JobTimestamp; // Changed
  updatedAt?: JobTimestamp; // Changed
};

// TODO: OBJECT_CALISTHENICS_REFACTOR: This class is undergoing refactoring.
// The `getProps()` method is a temporary measure for external consumers.
// Ideally, direct state access will be replaced by more behavior-oriented methods.
export class Queue {
  constructor(private readonly fields: QueueProps) {
    if (!fields.id || !fields.name || !fields.status || !fields.createdAt) {
      throw new DomainError("Queue ID, Name, Status, and CreatedAt are mandatory.");
    }
    // queueSchema.parse(fields); // TODO: Update queueSchema for VOs
  }

  public id(): QueueId {
    return this.fields.id;
  }

  public getProps(): Readonly<QueueProps> {
    return { ...this.fields };
  }

  // Individual getters removed: name, status, createdAt, updatedAt

  activate(): Queue {
    return new QueueBuilder(this.fields)
      .withStatus(QueueStatus.createActive()) // Use new static factory
      .withUpdatedAt(JobTimestamp.now()) // Use JobTimestamp
      .build();
  }

  pause(): Queue {
    return new QueueBuilder(this.fields)
      .withStatus(QueueStatus.createPaused()) // Use new static factory
      .withUpdatedAt(JobTimestamp.now()) // Use JobTimestamp
      .build();
  }

  drain(): Queue {
    return new QueueBuilder(this.fields)
      .withStatus(QueueStatus.createDraining()) // Use new static factory
      .withUpdatedAt(JobTimestamp.now()) // Use JobTimestamp
      .build();
  }

  public equals(other?: Queue): boolean {
    if (this === other) return true;
    if (!other || !(other instanceof Queue)) return false;

    const sameTimestamps = this.fields.updatedAt && other.fields.updatedAt
      ? this.fields.updatedAt.equals(other.fields.updatedAt)
      : this.fields.updatedAt === other.fields.updatedAt;

    return (
      this.fields.id.equals(other.fields.id) &&
      this.fields.name.equals(other.fields.name) &&
      this.fields.status.equals(other.fields.status) &&
      this.fields.createdAt.equals(other.fields.createdAt) &&
      sameTimestamps
    );
  }
}

export class QueueBuilder {
  private fields: Partial<QueueProps>;

  constructor(fields?: Partial<QueueProps>) {
    this.fields = fields ? { ...fields } : {};
    if (!this.fields.status) {
      this.fields.status = QueueStatus.createPaused(); // Default to paused
    }
    if (!this.fields.createdAt) {
      this.fields.createdAt = JobTimestamp.now(); // Default to now
    }
  }

  withId(id: QueueId): QueueBuilder {
    this.fields.id = id;
    return this;
  }

  withName(name: string): QueueBuilder { // Accepts primitive
    this.fields.name = QueueName.create(name); // Creates VO
    return this;
  }

  withStatus(status: QueueStatus): QueueBuilder {
    this.fields.status = status;
    return this;
  }

  withCreatedAt(createdAt: Date): QueueBuilder { // Accepts primitive
    this.fields.createdAt = JobTimestamp.create(createdAt); // Creates VO
    return this;
  }

  withUpdatedAt(updatedAt: Date): QueueBuilder { // Accepts primitive
    this.fields.updatedAt = JobTimestamp.create(updatedAt); // Creates VO
    return this;
  }

  build(): Queue {
    if (!this.fields.id) {
      throw new DomainError("Queue ID is required to build a Queue.");
    }
    if (!this.fields.name) {
      throw new DomainError("Queue Name is required to build a Queue.");
    }
    // Status and CreatedAt are defaulted by constructor.

    return new Queue({
      id: this.fields.id as QueueId,
      name: this.fields.name as QueueName,
      status: this.fields.status as QueueStatus,
      createdAt: this.fields.createdAt as JobTimestamp,
      updatedAt: this.fields.updatedAt, // Already JobTimestamp | undefined
    });
  }
}
