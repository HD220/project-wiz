/**
 * Queue Client Types - BullMQ-compatible interfaces for worker communication
 * 
 * Defines the message protocol and types for communication between main process 
 * and worker process, maintaining BullMQ API compatibility.
 */

// BullMQ-compatible job data and options
export interface JobData {
  [key: string]: unknown;
}

export interface JobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  parentJobId?: string;
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
}

// Job status types (BullMQ-compatible)
export type JobStatus = "waiting" | "active" | "completed" | "failed" | "delayed" | "paused";

// Job type for queue operations
export type JobType = JobStatus | "prioritized" | "waiting-children";

// BullMQ-compatible Job interface
export interface Job<T = JobData> {
  id: string;
  name: string;
  data: T;
  opts?: JobOptions;
  progress?: number;
  returnvalue?: any;
  failedReason?: string;
  stacktrace?: string;
  timestamp?: number;
  processedOn?: number;
  finishedOn?: number;
  attemptsMade?: number;
}

// Queue statistics (BullMQ-compatible)
export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

// ==================== IPC MESSAGE PROTOCOL ====================

// Base message interface
export interface BaseMessage {
  type: string;
  requestId: string;
  timestamp: number;
}

// Request message types
export interface QueueAddMessage extends BaseMessage {
  type: "queue:add";
  queueName: string;
  jobName: string;
  data: JobData;
  opts?: JobOptions;
}

export interface QueueGetJobsMessage extends BaseMessage {
  type: "queue:getJobs";
  queueName: string;
  types?: JobType | JobType[];
  start?: number;
  end?: number;
  asc?: boolean;
}

export interface QueueCleanMessage extends BaseMessage {
  type: "queue:clean";
  queueName: string;
  grace: number;
  limit: number;
  jobType?: JobStatus;
}

export interface QueueGetStatsMessage extends BaseMessage {
  type: "queue:getStats";
  queueName: string;
}

export interface QueueGetWaitingMessage extends BaseMessage {
  type: "queue:getWaiting";
  queueName: string;
  start?: number;
  end?: number;
}

export interface QueueGetCompletedMessage extends BaseMessage {
  type: "queue:getCompleted";
  queueName: string;
  start?: number;
  end?: number;
}

export interface QueueGetFailedMessage extends BaseMessage {
  type: "queue:getFailed";
  queueName: string;
  start?: number;
  end?: number;
}

// Union type for all request messages
export type QueueRequestMessage = 
  | QueueAddMessage
  | QueueGetJobsMessage
  | QueueCleanMessage
  | QueueGetStatsMessage
  | QueueGetWaitingMessage
  | QueueGetCompletedMessage
  | QueueGetFailedMessage;

// Response message interface
export interface QueueResponseMessage extends BaseMessage {
  type: "queue:response";
  success: boolean;
  result?: any;
  error?: string;
}

// Event message interface
export interface QueueEventMessage extends BaseMessage {
  type: "queue:event";
  queueName: string;
  event: "job:progress" | "job:completed" | "job:failed" | "job:waiting" | "job:active";
  jobId: string;
  data?: any;
}

// Union type for all messages
export type QueueMessage = QueueRequestMessage | QueueResponseMessage | QueueEventMessage;

// ==================== QUEUE CLIENT CONFIG ====================

export interface QueueClientConfig {
  /**
   * Timeout for queue operations in milliseconds
   * @default 30000
   */
  operationTimeout?: number;
  
  /**
   * Whether to automatically retry failed requests
   * @default true
   */
  autoRetry?: boolean;
  
  /**
   * Number of retry attempts for failed requests
   * @default 3
   */
  maxRetries?: number;
  
  /**
   * Delay between retry attempts in milliseconds
   * @default 1000
   */
  retryDelay?: number;
}

// ==================== ERROR TYPES ====================

export class QueueClientError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "QueueClientError";
  }
}

export class QueueTimeoutError extends QueueClientError {
  constructor(operation: string, timeout: number) {
    super(`Queue operation '${operation}' timed out after ${timeout}ms`);
    this.code = "TIMEOUT";
  }
}

export class QueueWorkerError extends QueueClientError {
  constructor(message: string) {
    super(`Worker error: ${message}`);
    this.code = "WORKER_ERROR";
  }
}

// ==================== UTILITY TYPES ====================

// Helper type for method responses
export type QueueMethodResponse<T> = Promise<T>;

// Helper type for job creation response
export interface AddJobResult {
  jobId: string;
  job: Job;
}

// Helper type for bulk operations
export interface BulkJobResult {
  jobs: Job[];
  count: number;
}