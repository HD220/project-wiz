import { JobId } from "./value-objects/job-id.vo";
import { Worker } from "../worker";
import { Queue } from "../queue";
import { Result, ok } from "@/core/common/result";

export enum JobStatus {
  PENDING = "pending",
  RUNNING = "executing",
  COMPLETED = "finished",
  FAILED = "failed",
  WAITING = "waiting",
}

export type JobConstructor = {
  id: JobId;
  name: string;
  payload: unknown;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  queue: Queue;
  worker?: Worker;
  attempts?: number;
  maxAttempts?: number;
  dependsOn?: string[];
  retryDelay?: number;
  result?: unknown; // Adicionado esta linha
};

export class Job {
  constructor(private readonly fields: JobConstructor) {
    this.fields.attempts = this.fields.attempts || 0;
    this.fields.maxAttempts = this.fields.maxAttempts || 3;
    this.fields.dependsOn = this.fields.dependsOn || [];
    this.fields.retryDelay = this.fields.retryDelay || 1000;
  }

  get id() {
    return this.fields.id;
  }

  get name() {
    return this.fields.name;
  }

  get status() {
    return this.fields.status;
  }

  get queue() {
    return this.fields.queue;
  }

  get worker() {
    return this.fields.worker;
  }

  get attempts() {
    return this.fields.attempts || 0;
  }

  get maxAttempts() {
    return this.fields.maxAttempts || 3;
  }

  get dependsOn() {
    return this.fields.dependsOn || [];
  }

  get retryDelay() {
    return this.fields.retryDelay || 1000;
  }

  get payload() {
    return this.fields.payload;
  }

  get result() {
    return this.fields.result;
  }

  static create(props: {
    name: string;
    payload: unknown;
    queue: Queue;
    maxAttempts?: number;
    dependsOn?: string[];
    retryDelay?: number;
  }): Result<Job> {
    return ok(
      new Job({
        id: JobId.generate(),
        name: props.name,
        payload: props.payload,
        status: JobStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        queue: props.queue,
        maxAttempts: props.maxAttempts,
        dependsOn: props.dependsOn,
        retryDelay: props.retryDelay,
      })
    );
  }
}
