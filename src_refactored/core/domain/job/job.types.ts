import { z } from "zod";

import { JobIdVO } from "./value-objects/job-id.vo";
import { IJobOptions, JobOptionsVO } from "./value-objects/job-options.vo";

export { IJobOptions } from "./value-objects/job-options.vo";

export enum JobStatus {
  WAITING = "waiting",
  ACTIVE = "active",
  COMPLETED = "completed",
  FAILED = "failed",
  DELAYED = "delayed",
  PAUSED = "paused",
}

export interface JobLogEntry {
  message: string;
  level: string;
  timestamp: Date;
}

export interface JobEntityProps<P = unknown, R = unknown> {
  id: JobIdVO;
  queueName: string;
  name: string;
  payload: P;
  options: JobOptionsVO;
  status: JobStatus;
  attemptsMade: number;
  progress: number | object;
  logs: JobLogEntry[];
  createdAt: Date;
  updatedAt: Date;
  processedOn?: Date;
  finishedOn?: Date;
  delayUntil?: Date;
  lockUntil?: Date;
  workerId?: string;
  returnValue?: R;
  failedReason?: string;
  stacktrace?: string[];
}

export const JobEntityPropsSchema = z.object({
  id: z.custom<JobIdVO>((val) => val instanceof JobIdVO),
  queueName: z.string(),
  name: z.string(),
  payload: z.any(),
  options: z.custom<JobOptionsVO>((val) => val instanceof JobOptionsVO),
  status: z.nativeEnum(JobStatus),
  attemptsMade: z.number().int().min(0),
  progress: z.union([z.number(), z.object({})]),
  logs: z.array(z.object({
    message: z.string(),
    level: z.string(),
    timestamp: z.date(),
  })),
  createdAt: z.date(),
  updatedAt: z.date(),
  delayUntil: z.date().optional().nullable(),
  finishedAt: z.date().optional().nullable(),
  processedAt: z.date().optional().nullable(),
  failedReason: z.string().optional().nullable(),
  stacktrace: z.array(z.string()).optional().nullable(),
  returnvalue: z.any().optional().nullable(),
  workerId: z.string().optional().nullable(),
  lockUntil: z.date().optional().nullable(),
});

export type JobPersistenceData<P = unknown, R = unknown> = {
  id: string;
  queueName: string;
  name: string;
  payload: P;
  // This includes priority
  options: IJobOptions;
  // Explicitly adding for top-level access in persistence if needed by consumers
  priority: number;
  status: JobStatus;
  attemptsMade: number;
  progress: number | object;
  logs: Array<{ message: string; level: string; timestamp: number }>;
  createdAt: number;
  updatedAt: number;
  processedOn?: number | null;
  finishedOn?: number | null;
  delayUntil?: number | null;
  lockUntil?: number | null;
  workerId?: string | null;
  returnValue?: R | null;
  failedReason?: string | null;
  stacktrace?: string[] | null;
};