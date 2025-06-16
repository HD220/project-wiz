// src/infrastructure/tools/task.tool.ts
import { Job } from '../../core/domain/entities/jobs/job.entity';
import {
  IListJobsUseCase,
  ListJobsUseCase // Assuming this will be injected, or its interface
} from '../../core/application/use-cases/job/list-jobs.usecase';
import {
  ISaveJobUseCase,
  SaveJobDTO,
  SaveJobUseCase // Assuming this will be injected
} from '../../core/application/use-cases/job/save-job.usecase';
import {
  IRemoveJobUseCase,
  RemoveJobUseCase // Assuming this will be injected
} from '../../core/application/use-cases/job/remove-job.usecase';
import { z } from 'zod'; // For ai-sdk tool parameter validation

// Schemas for AI SDK tool parameters
const listParamsSchema = z.object({
  queueId: z.string().describe("The ID of the queue to list jobs from."),
  limit: z.number().optional().describe("Maximum number of jobs to return."),
});

// Define a Zod schema for SaveJobDTO to be used with AI SDK
// This needs to match the structure of SaveJobDTO closely.
// Job.payload and Job.data can be complex, using z.record(z.string(), z.any()) or z.stringified(z.json())
const saveParamsSchema = z.object({
  id: z.string().optional().describe("The ID of the job to update. Omit for new job."),
  queueId: z.string().describe("The ID of the queue this job belongs to."),
  name: z.string().describe("The name of the job."),
  payload: z.record(z.string(), z.any()).optional().describe("The input payload for the job."), // Or z.any() if truly flexible
  data: z.record(z.string(), z.any()).optional().describe("Mutable data associated with the job."), // Or z.any()
  priority: z.number().optional().describe("Job priority (lower is higher)."),
  delay: z.number().optional().describe("Delay in milliseconds before the job is active."),
  maxAttempts: z.number().optional().describe("Maximum number of attempts."),
  // Add other fields from SaveJobDTO as needed by the agent's capabilities
}).describe("Parameters for creating or updating a job.");


const removeParamsSchema = z.object({
  jobId: z.string().describe("The ID of the job to remove."),
});

export interface ITaskTool {
  list(params: z.infer<typeof listParamsSchema>): Promise<Job<any, any>[]>; // Consider returning simplified job DTOs
  save(params: z.infer<typeof saveParamsSchema>): Promise<Job<any, any>>; // Consider returning simplified job DTO
  remove(params: z.infer<typeof removeParamsSchema>): Promise<void>;
}

export class TaskTool implements ITaskTool {
  constructor(
    private listJobsUseCase: IListJobsUseCase,
    private saveJobUseCase: ISaveJobUseCase,
    private removeJobUseCase: IRemoveJobUseCase
  ) {}

  // Method for AI SDK: list jobs
  async list(params: z.infer<typeof listParamsSchema>): Promise<Job<any, any>[]> {
    console.log(`TaskTool.list: Called with queueId=${params.queueId}, limit=${params.limit}`);
    // Input validation is handled by Zod when used with ai-sdk's tool system
    return this.listJobsUseCase.execute(params.queueId, params.limit);
  }

  // Method for AI SDK: save (create or update) a job
  async save(params: z.infer<typeof saveParamsSchema>): Promise<Job<any, any>> {
    console.log(`TaskTool.save: Called for job name ${params.name}`);
    // The 'params' object should conform to SaveJobDTO or be adaptable.
    // This assumes direct compatibility for simplicity here.
    // A mapping layer might be needed if Zod schema diverges significantly from SaveJobDTO.
    const jobData: SaveJobDTO = {
        id: params.id,
        queueId: params.queueId,
        name: params.name,
        payload: params.payload,
        data: params.data,
        priority: params.priority,
        delay: params.delay,
        maxAttempts: params.maxAttempts,
        // Ensure all required fields by SaveJobDTO are covered or are optional
    };
    return this.saveJobUseCase.execute(jobData);
  }

  // Method for AI SDK: remove a job
  async remove(params: z.infer<typeof removeParamsSchema>): Promise<void> {
    console.log(`TaskTool.remove: Called for jobId ${params.jobId}`);
    await this.removeJobUseCase.execute(params.jobId);
    // Note: RemoveJobUseCase currently has a placeholder for actual deletion.
    // This tool method will reflect that limitation until the use case is fully implemented.
  }
}
