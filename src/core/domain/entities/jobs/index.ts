import { z } from "zod";

export const JobStatus = {
  WAITING: "waiting",
  ACTIVE: "active",
  COMPLETED: "completed",
  FAILED: "failed",
  DELAYED: "delayed",
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export interface JobOptions {
  priority: number;
  delay: number;
  [key: string]: unknown;
}

const JobOptionsSchema = z
  .object({
    priority: z.number().int().min(0).max(10),
    delay: z.number().int().min(0),
  })
  .passthrough();

const JobDataSchema = z.record(z.unknown());

const JobSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  data: JobDataSchema,
  opts: JobOptionsSchema,
  status: z.nativeEnum(JobStatus),
  priority: z.number().int().min(0).max(10),
  delay: z.number().int().min(0),
  updatedAt: z.date(),
  startedAt: z.date().optional(),
  finishedAt: z.date().optional(),
  failedReason: z.string().optional(),
});

export type JobConstructor = z.infer<typeof JobSchema>;

export class Job {
  private fields: JobConstructor;

  constructor(fields: JobConstructor) {
    this.fields = JobSchema.parse(fields);
  }

  complete(): Job {
    return new Job({
      ...this.fields,
      status: JobStatus.COMPLETED,
      finishedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  fail(reason: string): Job {
    return new Job({
      ...this.fields,
      status: JobStatus.FAILED,
      failedReason: reason,
      finishedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  delay(ms: number): Job {
    return new Job({
      ...this.fields,
      status: JobStatus.DELAYED,
      delay: ms,
      updatedAt: new Date(),
    });
  }

  toJSON(): JobConstructor {
    return {
      id: this.fields.id,
      name: this.fields.name,
      data: this.fields.data,
      opts: this.fields.opts,
      status: this.fields.status,
      priority: this.fields.priority,
      delay: this.fields.delay,
      updatedAt: this.fields.updatedAt,
      startedAt: this.fields.startedAt,
      finishedAt: this.fields.finishedAt,
      failedReason: this.fields.failedReason,
    };
  }
}
