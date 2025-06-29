// src/infrastructure/tools/task.tool.ts
import {
  IListJobsUseCase,
  // ListJobsUseCase
} from '../../core/application/use-cases/job/list-jobs.usecase';
// import {
//   ISaveJobUseCase,
//   SaveJobDTO,
//   // SaveJobUseCase
// } from '../../core/application/use-cases/job/save-job.usecase'; // REMOVED
import {
  IRemoveJobUseCase,
  // RemoveJobUseCase
} from '../../core/application/use-cases/job/remove-job.usecase';
import { z } from 'zod';

// Imports from src_refactored
import { JobQueueService } from '@/src_refactored/core/application/queue/job-queue.service';
import { IJobOptions } from '@/src_refactored/core/domain/job/value-objects/job-options.vo';
import { JobEntity } from '@/src_refactored/core/domain/job/job.entity';
import { AgentExecutionPayload } from '@/src_refactored/core/domain/job/job-processing.types';


// Schemas for AI SDK tool parameters
const listParamsSchema = z.object({
  queueId: z.string().describe("The ID of the queue to list jobs from."),
  limit: z.number().optional().describe("Maximum number of jobs to return."),
});

const saveParamsSchema = z.object({
  queueId: z.string().describe("The ID of the queue this job belongs to. Must match the TaskTool's configured queue if different."),
  name: z.string().describe("The name/type of the job."),
  // Payload for AgentExecutionJobs should conform to AgentExecutionPayload
  payload: z.object({
    agentId: z.string(),
    initialPrompt: z.string().optional(),
    projectId: z.string().optional(),
    userId: z.string().optional(),
  }).describe("The input payload for the agent execution job.").passthrough(), // Allow other props in payload
  priority: z.number().optional().describe("Job priority."),
  delay: z.number().optional().describe("Delay in milliseconds."),
  maxAttempts: z.number().optional().describe("Maximum number of attempts."),
  // TODO: Add dependsOnJobIds, parentId to schema if needed by agents
  // dependsOnJobIds: z.array(z.string()).optional().describe("Job IDs this job depends on."),
  // parentId: z.string().optional().describe("Parent job ID for flows."),
}).describe("Parameters for creating a new agent execution job.");


const removeParamsSchema = z.object({
  jobId: z.string().describe("The ID of the job to remove."),
});

// Interface for old Job structure for list method compatibility (if needed temporarily)
interface OldJob<P, R> { id: { value: string }; name: () => { value: string }; props: any; }


export interface ITaskTool {
  list(params: z.infer<typeof listParamsSchema>): Promise<OldJob<any, any>[]>;
  save(params: z.infer<typeof saveParamsSchema>): Promise<JobEntity<AgentExecutionPayload, any>>; // Return new JobEntity
  remove(params: z.infer<typeof removeParamsSchema>): Promise<void>;
}

export class TaskTool implements ITaskTool {
  constructor(
    private listJobsUseCase: IListJobsUseCase, // Keep for now
    private removeJobUseCase: IRemoveJobUseCase, // Keep for now
    private jobQueueService: JobQueueService<AgentExecutionPayload, any>, // Injected, specific to a queue
  ) {}

  async list(params: z.infer<typeof listParamsSchema>): Promise<OldJob<any, any>[]> {
    console.log(`TaskTool.list: Called with queueId=${params.queueId}, limit=${params.limit}`);
    if (params.queueId !== this.jobQueueService.name) {
        console.warn(`TaskTool.list called for queue '${params.queueId}' but tool is configured for '${this.jobQueueService.name}'. Listing from configured queue.`);
    }
    // This ListJobsUseCase is from the old system. It would need to be refactored
    // or JobQueueService needs a getJobs method. For now, this will likely fail or return old job types.
    // This part needs more significant refactoring if listJobs is to use the new system.
    // Returning empty array as placeholder for this method's refactor.
    console.warn("TaskTool.list is using old ListJobsUseCase. Needs refactoring to use new queue system.");
    // return this.listJobsUseCase.execute(this.jobQueueService.name, params.limit);
    return Promise.resolve([]);
  }

  async save(params: z.infer<typeof saveParamsSchema>): Promise<JobEntity<AgentExecutionPayload, any>> {
    console.log(`TaskTool.save: Called for job name ${params.name} on queue ${this.jobQueueService.name}`);

    if (params.queueId && params.queueId !== this.jobQueueService.name) {
        const warningMsg = `TaskTool attempting to save to queue '${params.queueId}' but is configured for queue '${this.jobQueueService.name}'. Using configured queue: '${this.jobQueueService.name}'.`;
        console.warn(warningMsg);
        // Potentially, this tool could add a log to the job about this redirection if job has logging before save.
    }

    const jobOptions: IJobOptions = {
      priority: params.priority,
      delay: params.delay,
      attempts: params.maxAttempts,
      // dependsOnJobIds: params.dependsOnJobIds, // Add if part of schema
      // parentId: params.parentId, // Add if part of schema
    };

    // Payload needs to be AgentExecutionPayload
    const payload: AgentExecutionPayload = {
        agentId: params.payload.agentId,
        initialPrompt: params.payload.initialPrompt,
        projectId: params.payload.projectId,
        userId: params.payload.userId,
        ...params.payload // include any other passthrough properties
    };

    const result = await this.jobQueueService.add(
      params.name,
      payload,
      jobOptions
    );

    if (result.isError()) {
      console.error(`TaskTool.save: Failed to add job via JobQueueService:`, result.error);
      // Convert to a generic error or re-throw. ToolError might be suitable.
      throw new Error(`Failed to save job using new queue service: ${result.error.message}`);
    }
    return result.value;
  }

  async remove(params: z.infer<typeof removeParamsSchema>): Promise<void> {
    console.log(`TaskTool.remove: Called for jobId ${params.jobId} on queue ${this.jobQueueService.name}`);
    // This removeJobUseCase is from the old system.
    // JobQueueService needs a removeJob method.
    console.warn("TaskTool.remove is using old RemoveJobUseCase. Needs refactoring to use new queue system.");
    // await this.removeJobUseCase.execute(params.jobId);
    return Promise.resolve();
  }
}

// Tool definition generation part needs to be updated if IAgentTool is from src_refactored
import { IAgentTool as IRefactoredAgentTool } from '@/src_refactored/core/tools/tool.interface';

// This function now needs to align with IRefactoredAgentTool if that's the target.
// The execute methods for list and remove will need significant changes to work with JobQueueService.
export function getTaskToolDefinitions(taskToolInstance: TaskTool): IRefactoredAgentTool<any, any>[] {
  return [
    {
      name: 'taskManager.saveJob',
      description: 'Creates a new agent execution job in the configured queue.',
      parameters: saveParamsSchema,
      execute: async (params, execContext) => {
        // Note: The execute function for IRefactoredAgentTool expects Result<Output, ToolError>
        // The TaskTool.save currently throws on error or returns JobEntity.
        // This needs an adapter or TaskTool.save needs to return Result.
        console.log("[TaskToolDefinition] taskManager.saveJob called with params:", params, "Context:", execContext);
        try {
            const jobEntity = await taskToolInstance.save(params as z.infer<typeof saveParamsSchema>);
            // Convert JobEntity to a simpler output if necessary, or return its ID.
            return Ok({ jobId: jobEntity.id.value, status: jobEntity.status.value });
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            return Err(new ToolError(err.message, 'taskManager.saveJob', err));
        }
      },
    },
    // {
    //   name: 'taskManager.listJobs',
    //   description: 'Lists jobs in a specified queue. (Currently placeholder - needs refactor)',
    //   parameters: listParamsSchema,
    //   execute: async (params) => {
    //     // const jobs = await taskToolInstance.list(params);
    //     // return Ok(jobs.map(j => ({id: j.id.value, name: j.name().value, status: j.props.status.value() })));
    //     return Ok([]);
    //   },
    // },
    // {
    //   name: 'taskManager.removeJob',
    //   description: 'Removes a job by its ID. (Currently placeholder - needs refactor)',
    //   parameters: removeParamsSchema,
    //   execute: async (params) => {
    //     // await taskToolInstance.remove(params);
    //     // return Ok({ message: `Job ${params.jobId} removal process initiated.` });
    //     return Ok({});
    //   },
    // }
  ];
}
