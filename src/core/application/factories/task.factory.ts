import { IAgentServiceFacade } from '../ports/agent-service-facade.interface';
import { ITask, TaskResult } from '../ports/task.interface';
import { ActivityContext } from '@/core/domain/entities/job/value-objects/activity-context.vo';
import { SimpleEchoTask } from '../tasks/simple-echo.task';
import { EchoToolTask } from '../tasks/echo-tool.task'; // Import the new task

// Placeholder for actual task implementations that will be created in a later phase
// Example: import { MySpecificTask } from '../tasks/my-specific.task';

export class TaskFactory implements IAgentServiceFacade {
  private readonly taskRegistry: Map<string, new (...args: any[]) => ITask>;

  constructor() {
    this.taskRegistry = new Map();
    this.registerTask('SimpleEchoTask', SimpleEchoTask);
    this.registerTask('EchoToolTask', EchoToolTask); // Register the new task
  }

  // Optional: Method to register tasks dynamically if needed
  public registerTask(taskName: string, taskConstructor: new (...args: any[]) => ITask): void {
    if (this.taskRegistry.has(taskName)) {
      console.warn(`Task with name ${taskName} is already registered. Overwriting.`);
    }
    this.taskRegistry.set(taskName, taskConstructor);
  }

  async executeTask(
    taskNameOrType: string,
    context: ActivityContext,
    taskParameters?: Record<string, any>, // Added
    agentId?: string
  ): Promise<TaskResult> {
    const TaskConstructor = this.taskRegistry.get(taskNameOrType);
    if (!TaskConstructor) {
      console.error(`No task registered for name: ${taskNameOrType}`);
      // Return a failed TaskResult or throw an error
      return {
        success: false,
        error: `Task not found: ${taskNameOrType}`,
        nextActivityContext: context // Return original context on failure
      };
    }

    try {
      // Assuming task constructor might take dependencies, but SimpleEchoTask doesn't for now.
      // If tasks need dependencies, this factory needs to be more sophisticated (e.g., DI container).
      const taskInstance: ITask = new TaskConstructor();
      return await taskInstance.execute(context, taskParameters, agentId); // Pass parameters
    } catch (e) {
      console.error(`Error executing task ${taskNameOrType}:`, e);
      return {
        success: false,
        error: `Error during task execution: ${e instanceof Error ? e.message : String(e)}`,
        nextActivityContext: context
      };
    }
  }
}
