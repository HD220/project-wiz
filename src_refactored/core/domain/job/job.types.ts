import { JobIdVO } from "./value-objects/job-id.vo";
import { IJobOptions, JobOptionsVO } from "./value-objects/job-options.vo";

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

export type JobPersistenceData<P = unknown, R = unknown> = {
  id: string;
  queueName: string;
  name: string;
  payload: P;
  options: IJobOptions; // This includes priority
  priority: number; // Explicitly adding for top-level access in persistence if needed by consumers
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
