import { WorkerId } from "./value-objects/worker-id.vo";
import { WorkerStatus } from "./value-objects/worker-status.vo";
import { workerSchema } from "./worker.schema";

type WorkerProps = {
  id: WorkerId;
  name: string;
  status: WorkerStatus;
  createdAt: Date;
  updatedAt?: Date;
};

export class Worker {
  constructor(private readonly fields: WorkerProps) {
    workerSchema.parse(fields);
  }

  get id(): WorkerId {
    return this.fields.id;
  }

  get name(): string {
    return this.fields.name;
  }

  get status(): WorkerStatus {
    return this.fields.status;
  }

  get createdAt(): Date {
    return this.fields.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.fields.updatedAt;
  }

  allocateToJob(): Worker {
    return new WorkerBuilder(this.fields)
      .withStatus(WorkerStatus.busy())
      .withUpdatedAt(new Date())
      .build();
  }

  release(): Worker {
    return new WorkerBuilder(this.fields)
      .withStatus(WorkerStatus.available())
      .withUpdatedAt(new Date())
      .build();
  }

  isAvailable(): boolean {
    return this.fields.status.value === "available";
  }
}

export class WorkerBuilder {
  private fields: Partial<WorkerProps>;

  constructor(fields?: Partial<WorkerProps>) {
    this.fields = fields ? { ...fields } : {};
  }

  withId(id: WorkerId): WorkerBuilder {
    this.fields.id = id;
    return this;
  }

  withName(name: string): WorkerBuilder {
    this.fields.name = name;
    return this;
  }

  withStatus(status: WorkerStatus): WorkerBuilder {
    this.fields.status = status;
    return this;
  }

  withCreatedAt(createdAt: Date): WorkerBuilder {
    this.fields.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): WorkerBuilder {
    this.fields.updatedAt = updatedAt;
    return this;
  }

  build(): Worker {
    return new Worker({
      id: this.fields.id!,
      name: this.fields.name!,
      status: this.fields.status!,
      createdAt: this.fields.createdAt!,
      updatedAt: this.fields.updatedAt,
    });
  }
}
