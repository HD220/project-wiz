import { z } from "zod";
import { JobStatus, JobStatusValues } from "./job-status";

export const jobOptionsSchema = z
  .object({
    priority: z.number().int().min(0).max(10),
    delay: z.number().int().min(0),
  })
  .passthrough();

export type JobOptions = z.infer<typeof jobOptionsSchema>;

const jobDataSchema = z.record(z.unknown());

const jobSchema = z.object({
  id: z.string().uuid(),
  queueId: z.string().uuid(),
  name: z.string().min(1),
  data: jobDataSchema,
  opts: jobOptionsSchema,
  status: z.instanceof(JobStatus),
  delayedUntil: z.date().nullish(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  startedAt: z.date().nullish(),
  finishedAt: z.date().nullish(),
  failedReason: z.string().nullish(),
});

export type JobConstructor = z.infer<typeof jobSchema>;

export class Job {
  private fields: JobConstructor;

  constructor(fields: JobConstructor) {
    this.fields = jobSchema.parse(fields);
  }

  // Getters para todos os campos
  get id(): string {
    return this.fields.id;
  }

  get queueId(): string {
    return this.fields.queueId;
  }

  get name(): string {
    return this.fields.name;
  }

  get data(): Record<string, unknown> {
    return this.fields.data;
  }

  get opts(): JobOptions {
    return this.fields.opts;
  }

  get status(): JobStatus {
    return this.fields.status;
  }

  get delayedUntil(): Date | null | undefined {
    return this.fields.delayedUntil;
  }

  get createdAt(): Date {
    return this.fields.createdAt;
  }

  get updatedAt(): Date {
    return this.fields.updatedAt;
  }

  get startedAt(): Date | null | undefined {
    return this.fields.startedAt;
  }

  get finishedAt(): Date | null | undefined {
    return this.fields.finishedAt;
  }

  get failedReason(): string | null | undefined {
    return this.fields.failedReason;
  }

  isWaiting(): boolean {
    return this.fields.status.is(JobStatusValues.WAITING);
  }

  isActive(): boolean {
    return this.fields.status.is(JobStatusValues.ACTIVE);
  }

  isDelayCompleted(): boolean {
    if (!this.fields.status.is(JobStatusValues.DELAYED)) return true;
    if (!this.fields.delayedUntil) return true;
    return new Date() >= this.fields.delayedUntil;
  }

  moveToWaiting(): boolean {
    const success = this.fields.status.moveTo(JobStatusValues.WAITING);
    if (success) this.fields.updatedAt = new Date();
    return success;
  }

  moveToActive(): boolean {
    const success = this.fields.status.moveTo(JobStatusValues.ACTIVE);
    if (success) {
      this.fields.startedAt = new Date();
      this.fields.updatedAt = new Date();
    }
    return success;
  }

  moveToComplete(): void {
    if (this.fields.status.moveTo(JobStatusValues.COMPLETED)) {
      this.fields.finishedAt = new Date();
      this.fields.updatedAt = new Date();
    }
  }

  moveToFail(reason: string): void {
    if (this.fields.status.moveTo(JobStatusValues.FAILED)) {
      this.fields.failedReason = reason;
      this.fields.finishedAt = new Date();
      this.fields.updatedAt = new Date();
    }
  }

  moveToDelay(ms?: number): void {
    if (this.fields.status.moveTo(JobStatusValues.DELAYED)) {
      const miliseconds = ms || this.opts.delay || 0;
      this.fields.delayedUntil = new Date(Date.now() + miliseconds);
      this.fields.updatedAt = new Date();
    }
  }
}
