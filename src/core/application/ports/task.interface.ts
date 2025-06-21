import { ActivityContext } from '@/core/domain/entities/job/value-objects/activity-context.vo'; // Adjust path
// Define a TaskResult type/interface if specific structure is needed
export interface TaskResult {
  success: boolean;
  output?: any; // Placeholder for task output
  error?: string;
  nextActivityContext?: ActivityContext; // Optional: if the task wants to propose context changes
}

export interface ITask {
  // readonly name: string; // Optional
  execute(
    context: ActivityContext,
    taskParameters?: Record<string, any>, // Added for task-specific input
    agentId?: string
  ): Promise<TaskResult>;
}
