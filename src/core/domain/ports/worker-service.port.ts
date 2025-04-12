import type { LlamaContextOptions, LLamaChatPromptOptions } from 'node-llama-cpp';

export interface WorkerMetrics {
  totalTokensProcessed: number;
  totalRequests: number;
  averageResponseTimeMs: number;
  errorCount: number;
  memoryUsageMB: number;
  timestamp: number;
}

export interface WorkerServicePort {
  createContext(options?: LlamaContextOptions): Promise<void>;

  prompt(prompt: string, options?: LLamaChatPromptOptions): Promise<string>;

  getMetrics(): Promise<WorkerMetrics>;

  /**
   * Pauses an active LLM session.
   * @param sessionId The session identifier.
   */
  pauseSession(sessionId: string): Promise<void>;

  /**
   * Cancels (ends) an active LLM session.
   * @param sessionId The session identifier.
   */
  cancelSession(sessionId: string): Promise<void>;
}