import type { JobData, JobOptions, JobResult, JobStatus } from "./llm-jobs.model";

/**
 * Job submission input for API consumers
 */
export interface AddJobInput {
  name: string;
  data: JobData;
  options?: JobOptions;
}

/**
 * Job status response for API consumers
 */
export interface JobStatusResponse {
  id: string;
  name: string;
  status: JobStatus;
  progress: number;
  result: JobResult | null;
  error: string | null;
  createdAt: Date;
  processedOn: Date | null;
  finishedOn: Date | null;
}

/**
 * Completed job response for polling
 */
export interface CompletedJobResponse {
  id: string;
  name: string;
  status: JobStatus;
  result: JobResult | null;
  error: string | null;
  finishedOn: Date | null;
}

/**
 * Failed job response for error monitoring
 */
export interface FailedJobResponse {
  id: string;
  name: string;
  error: string | null;
  stacktrace: string | null;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  finishedOn: Date | null;
}

/**
 * Queue statistics response
 */
export interface QueueStatsResponse {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

/**
 * Pending job response for monitoring
 */
export interface PendingJobResponse {
  id: string;
  name: string;
  priority: number;
  status: JobStatus;
  createdAt: Date;
  delay: number;
}

/**
 * Common job types used throughout the application
 */
export type LLMJobType = 
  | "process-message"        // Process user message with LLM
  | "analyze-code"           // Analyze code with LLM
  | "generate-response"      // Generate AI response
  | "extract-requirements"   // Extract requirements from text
  | "summarize-content"      // Summarize long content
  | "translate-text"         // Translate text between languages
  | "review-code"            // Review code for issues
  | "generate-tests"         // Generate test cases
  | "explain-code"           // Explain code functionality
  | "refactor-suggestions";  // Suggest code refactoring

/**
 * Message processing job data
 */
export interface ProcessMessageJobData extends JobData {
  userId: string;
  conversationId: string;
  sourceType: "dm" | "channel";
  sourceId: string;
  message: string;
  messageId: string;
  context?: {
    previousMessages?: Array<{
      role: "user" | "assistant";
      content: string;
      timestamp: Date;
    }>;
    systemPrompt?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

/**
 * Code analysis job data
 */
export interface AnalyzeCodeJobData extends JobData {
  userId: string;
  projectId?: string;
  code: string;
  language: string;
  analysisType: "review" | "explain" | "test-generation" | "refactor";
  context?: {
    fileName?: string;
    relatedFiles?: string[];
    requirements?: string;
  };
}

/**
 * Job progress update for real-time UI
 */
export interface JobProgressUpdate {
  jobId: string;
  progress: number;
  status: JobStatus;
  intermediateResult?: Partial<JobResult>;
}

/**
 * Job completion event for real-time UI
 */
export interface JobCompletionEvent {
  jobId: string;
  result: JobResult;
  error?: string;
  duration: number;
}