export type JobStatus =
  | "waiting"
  | "active"
  | "completed"
  | "failed"
  | "delayed";

export interface JobData<T = unknown> {
  id: string;
  payload: T;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  priority: number;
}

export interface JobState<R = unknown> {
  status: JobStatus;
  processedAt?: number;
  completedAt?: number;
  failedReason?: string;
  delay?: number;
  progress?: number;
  result?: R;
}

export interface Job<T = unknown, R = unknown> {
  readonly id: string;
  readonly data: JobData<T>;
  readonly state: JobState;

  process(): Promise<void>;
  complete(result: R): Promise<void>;
  fail(reason: string): Promise<void>;
  moveToDelay(ms: number): Promise<boolean>;
  updateProgress(progress: number): Promise<void>;
}
