import { ActivityContext } from '@/core/domain/entities/job/value-objects/activity-context.vo';
import { TaskResult } from './task.interface'; // Assuming TaskResult is defined, ITask removed

// This interface defines what the AutonomousAgent uses to execute specific tasks.
// It decouples the Agent from knowing how to instantiate or find specific task handlers.
export interface IAgentServiceFacade {
  /**
   * Executes a task based on its name or type, using the provided context.
   * @param taskNameOrType Identifier for the task to execute.
   * @param context The current ActivityContext for the task.
   * @param agentId The ID of the agent requesting the task execution.
   * @returns A Promise with the TaskResult.
   * @throws Error if the task cannot be found or fails instantiation.
   */
  executeTask(
    taskNameOrType: string,
    context: ActivityContext,
    taskParameters?: Record<string, any>, // Added
    agentId?: string
  ): Promise<TaskResult>;
}
