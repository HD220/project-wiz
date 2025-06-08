import { Job } from "../../domain/entities/job";

export interface Worker {
  /**
   * Starts the worker to listen to the specified agent's queue
   * @param agentId Agent ID to identify the queue
   * @param processingFn Processing function to execute for each job
   */
  start(
    agentId: string,
    processingFn: (job: Job) => Promise<void>
  ): Promise<void>;

  /**
   * Stops the worker execution
   */
  stop(): Promise<void>;

  /**
   * Checks if the worker is running
   */
  isRunning(): boolean;
}
