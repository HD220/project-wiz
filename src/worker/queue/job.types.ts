export interface JobExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  duration?: number;
}

// Job processor configuration
export interface ProcessorConfig {
  pollInterval: number; // milliseconds
  maxConcurrentJobs: number;
  retryDelay: number; // milliseconds
}

// BullMQ-inspired types
export type JobFunction<T = any, R = any> = (job: Job<T>) => Promise<R>;

export interface Job<T = any> {
  id: string;
  name: string;
  data: T;
  opts?: JobOptions;
}

export interface JobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  parentJobId?: string;
}
