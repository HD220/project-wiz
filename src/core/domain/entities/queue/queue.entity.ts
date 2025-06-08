import { QueueId } from "./value-objects/queue-id.vo";
import { QueueStatus } from "./value-objects/queue-status.vo";
import { queueSchema } from "./queue.schema";

type QueueProps = {
  id: QueueId;
  name: string;
  status: QueueStatus;
  createdAt: Date;
  updatedAt?: Date;
};

export class Queue {
  constructor(private readonly fields: QueueProps) {
    queueSchema.parse(fields);
  }

  get id(): QueueId {
    return this.fields.id;
  }

  get name(): string {
    return this.fields.name;
  }

  get status(): QueueStatus {
    return this.fields.status;
  }

  get createdAt(): Date {
    return this.fields.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.fields.updatedAt;
  }

  activate(): Queue {
    return new QueueBuilder(this.fields)
      .withStatus(new QueueStatus("ACTIVE"))
      .withUpdatedAt(new Date())
      .build();
  }

  pause(): Queue {
    return new QueueBuilder(this.fields)
      .withStatus(new QueueStatus("PAUSED"))
      .withUpdatedAt(new Date())
      .build();
  }

  drain(): Queue {
    return new QueueBuilder(this.fields)
      .withStatus(new QueueStatus("DRAINING"))
      .withUpdatedAt(new Date())
      .build();
  }
}

export class QueueBuilder {
  private fields: Partial<QueueProps>;

  constructor(fields?: Partial<QueueProps>) {
    this.fields = fields ? { ...fields } : {};
  }

  withId(id: QueueId): QueueBuilder {
    this.fields.id = id;
    return this;
  }

  withName(name: string): QueueBuilder {
    this.fields.name = name;
    return this;
  }

  withStatus(status: QueueStatus): QueueBuilder {
    this.fields.status = status;
    return this;
  }

  withCreatedAt(createdAt: Date): QueueBuilder {
    this.fields.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): QueueBuilder {
    this.fields.updatedAt = updatedAt;
    return this;
  }

  build(): Queue {
    return new Queue({
      id: this.fields.id!,
      name: this.fields.name!,
      status: this.fields.status!,
      createdAt: this.fields.createdAt!,
      updatedAt: this.fields.updatedAt,
    });
  }
}
