// src_refactored/core/application/ports/services/i-worker.service.ts
import { TargetAgentRoleVO } from '../../../domain/job/value-objects/target-agent-role.vo';

/**
 * @interface IWorkerService
 * @description Defines the contract for a worker service that processes jobs for a specific agent role.
 * The worker typically runs a loop to fetch and execute jobs.
 */
export interface IWorkerService {
  /**
   * Starts the worker's processing loop for the given agent role.
   * The worker will periodically check for and process eligible jobs matching this role.
   * @param {TargetAgentRoleVO} role - The specific agent role this worker instance will handle.
   * @returns {Promise<void>} A promise that resolves when the starting process is initiated.
   * @throws {Error} if the worker is already running or if initialization fails.
   */
  start(role: TargetAgentRoleVO): Promise<void>;

  /**
   * Stops the worker's processing loop.
   * Any job currently being processed might complete, but no new jobs will be picked up.
   * @returns {Promise<void>} A promise that resolves when the stopping process is initiated.
   * @throws {Error} if the worker is not running or if stopping fails.
   */
  stop(): Promise<void>;

  /**
   * Checks if the worker is currently running its processing loop.
   * @returns {boolean} True if the worker is running, false otherwise.
   */
  isRunning(): boolean;
}
