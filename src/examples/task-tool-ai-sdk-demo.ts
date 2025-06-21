// src/examples/task-tool-ai-sdk-demo.ts
import { generateObject, tool } from 'ai'; // Using generateObject for structured output
import { deepseek } from '@ai-sdk/deepseek'; // Or your preferred LLM provider
import { z } from 'zod';

import { IJobRepository } from '../core/ports/repositories/job.interface';
import { Job, JobProps } from '../core/domain/entities/jobs/job.entity';
import { JobStatus, JobStatusType } from '../core/domain/entities/jobs/job-status';
import { ListJobsUseCase } from '../core/application/use-cases/job/list-jobs.usecase';
import { SaveJobUseCase, SaveJobDTO } from '../core/application/use-cases/job/save-job.usecase';
import { RemoveJobUseCase } from '../core/application/use-cases/job/remove-job.usecase';
import { TaskTool } from '../infrastructure/tools/task.tool';
// TaskManagerAgent is not directly used in this demo, as we are showing tool invocation.
// import { TaskManagerAgent } from '../infrastructure/agents/task-manager.agent';

// --- Mock IJobRepository for the demo ---
class MockJobRepository implements IJobRepository {
  private jobs: Job<any, any>[] = [];
  private nextId = 1;

  constructor() {
    // Add some initial mock jobs
    const qId = "demo-queue-123";
    this.jobs.push(new Job({ id: `job_${this.nextId++}`, queueId: qId, name: "Existing Job 1", payload: { info: "details1" }, priority:1, status: JobStatus.create(JobStatusType.WAITING), attempts:0, maxAttempts:3, createdAt: new Date(), updatedAt: new Date() }));
    this.jobs.push(new Job({ id: `job_${this.nextId++}`, queueId: qId, name: "Existing Job 2", payload: { info: "details2" }, priority:2, status: JobStatus.create(JobStatusType.WAITING), attempts:0, maxAttempts:3, createdAt: new Date(), updatedAt: new Date() }));
    this.jobs.push(new Job({ id: `job_${this.nextId++}`, queueId: "other-queue-456", name: "Other Queue Job", payload: { info: "details3" }, priority:1, status: JobStatus.create(JobStatusType.WAITING), attempts:0, maxAttempts:3, createdAt: new Date(), updatedAt: new Date() }));
  }

  async findById(id: string): Promise<Job<any, any> | null> {
    return this.jobs.find(j => j.id === id) || null;
  }
  async save(job: Job<any, any>): Promise<void> {
    const existingIndex = this.jobs.findIndex(j => j.id === job.id);
    if (existingIndex > -1) {
      this.jobs[existingIndex] = job;
    } else {
      // Simulate ID generation if not present (Job.create should do this)
      if (!job.id) {
        (job as any).id = `job_${this.nextId++}`;
      }
      this.jobs.push(job);
    }
    console.log(`MockJobRepository: Saved job ${job.id} - ${job.name}. Total jobs: ${this.jobs.length}`);
  }
  async update(job: Job<any, any>): Promise<void> { // Added for completeness, save handles upsert
    const existingIndex = this.jobs.findIndex(j => j.id === job.id);
    if (existingIndex > -1) {
      this.jobs[existingIndex] = job;
       console.log(`MockJobRepository: Updated job ${job.id} - ${job.name}`);
    } else {
        throw new Error("Job not found for update");
    }
  }
  async findPending(queueId: string, limit: number): Promise<Job<any, any>[]> {
    return this.jobs.filter(j => j.queueId === queueId && j.status.value === JobStatusType.WAITING).slice(0, limit);
  }
  // Add mock for delete if RemoveJobUseCase is to be fully demoed
  async delete(jobId: string): Promise<void> {
    const initialLength = this.jobs.length;
    this.jobs = this.jobs.filter(j => j.id !== jobId);
    if (this.jobs.length < initialLength) {
        console.log(`MockJobRepository: Deleted job ${jobId}. Total jobs: ${this.jobs.length}`);
    } else {
        console.warn(`MockJobRepository: Job ${jobId} not found for deletion.`);
    }
  }
}

async function runDemo() {
  console.log("--- TaskTool AI SDK Demo ---");

  // Ensure DEEPSEEK_API_KEY is set in your .env file for this demo to run
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error("DEEPSEEK_API_KEY is not set. This demo requires it to call the LLM.");
    console.log("Please set it in your .env file (e.g., DEEPSEEK_API_KEY=your_key_here) and ensure dotenv is configured (e.g. `import 'dotenv/config';` at the top of your main app file, or run with `tsx -r dotenv/config src/examples/task-tool-ai-sdk-demo.ts`)");
    return;
  }

  // 1. Instantiate dependencies
  const mockJobRepo = new MockJobRepository();

  // Add the delete method to the mock repository instance for the demo
  (mockJobRepo as IJobRepository).delete = async (jobId: string): Promise<void> => {
    const initialLength = (mockJobRepo as any).jobs.length;
    (mockJobRepo as any).jobs = (mockJobRepo as any).jobs.filter((j: Job<any,any>) => j.id !== jobId);
    if ((mockJobRepo as any).jobs.length < initialLength) {
        console.log(`MockJobRepository: Deleted job ${jobId}. Total jobs: ${(mockJobRepo as any).jobs.length}`);
    } else {
        console.warn(`MockJobRepository: Job ${jobId} not found for deletion.`);
        // throw new Error(`Job ${jobId} not found for deletion.`); // Or throw
    }
  };


  const listJobsUseCase = new ListJobsUseCase(mockJobRepo);
  const saveJobUseCase = new SaveJobUseCase(mockJobRepo);
  const removeJobUseCase = new RemoveJobUseCase(mockJobRepo); // Will warn about delete

  // 2. Instantiate TaskTool
  const taskTool = new TaskTool(listJobsUseCase, saveJobUseCase, removeJobUseCase);

  // 3. Define tools for ai-sdk using methods from TaskTool
  // Schemas are defined within task.tool.ts and used by its methods.
  // Here we just pass the methods directly if their signatures are compatible
  // or wrap them if adaptation is needed.
  // For `generateObject`, the tools are described by Zod schemas.

  const toolsForAISDK = {
    listJobs: tool({
      description: "Lists jobs in a specified queue.",
      parameters: z.object({
        queueId: z.string().describe("The ID of the queue to list jobs from."),
        limit: z.number().optional().describe("Maximum number of jobs to return (default 20).")
      }),
      execute: async ({ queueId, limit }) => taskTool.list({ queueId, limit: limit || 20 }),
    }),
    saveJob: tool({
      description: "Creates a new job or updates an existing one.",
      parameters: z.object({ // This schema should ideally be imported from task.tool.ts or a shared location
        id: z.string().optional().describe("The ID of the job to update. Omit for new job."),
        queueId: z.string().describe("The ID of the queue this job belongs to."),
        name: z.string().describe("The name of the job."),
        payload: z.record(z.string(), z.any()).optional().describe("The input payload for the job."),
        priority: z.number().optional().describe("Job priority (lower is higher)."),
        // Add other relevant fields from SaveJobDTO/JobProps
      }),
      execute: async (params) => taskTool.save(params as SaveJobDTO), // Cast needed if schema here differs slightly
    }),
    removeJob: tool({
      description: "Removes a specific job by its ID.",
      parameters: z.object({ jobId: z.string().describe("The ID of the job to remove.") }),
      execute: async ({ jobId }) => taskTool.remove({ jobId }),
    }),
  };

  // 4. Simulate an LLM call
  const userPrompt = "List all jobs in the 'demo-queue-123' queue, then create a new job in the same queue called 'My New AI Job' with payload { detail: 'important task' } and priority 1. Finally, remove job_1.";

  console.log(`
Simulating LLM call with prompt: "${userPrompt}"`);

  try {
    const { object: operationSummary, toolCalls, toolResults } = await generateObject({
      model: deepseek('deepseek-chat'), // Ensure this model supports tool usage well
      prompt: userPrompt,
      tools: toolsForAISDK,
      // We can use a schema to guide the LLM's final response structure if needed.
      // For this demo, we'll just log the tool calls and results.
      schema: z.object({
        summaryOfOperations: z.string().describe("A brief summary of what was done."),
        jobsListed: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
        jobSaved: z.object({ id: z.string(), name: z.string() }).optional(),
        jobRemovedId: z.string().optional()
      })
    });

    console.log("
--- LLM Interaction Result ---");
    console.log("LLM Final Summary:", operationSummary);

    if (toolCalls && toolCalls.length > 0) {
        console.log("
Tool Calls Made by LLM:");
        toolCalls.forEach(tc => console.log(tc));
    }
    if (toolResults && toolResults.length > 0) {
        console.log("
Tool Execution Results:");
        toolResults.forEach(tr => console.log(tr));
    }


  } catch (error) {
    console.error("
Error during LLM generateObject call:", error);
  }

  console.log("
--- Current Mock Repository State ---");
  console.log("Jobs:", await mockJobRepo.findPending("demo-queue-123", 10));
  console.log("All Jobs in Repo:", (mockJobRepo as any).jobs.map((j: Job<any,any>) => ({id: j.id, name: j.name, queueId: j.queueId, status: j.status.value })));

  console.log("
Demo finished. To run this, ensure DEEPSEEK_API_KEY is in .env and execute with `tsx -r dotenv/config src/examples/task-tool-ai-sdk-demo.ts` (if dotenv is not globally configured in your main app entry point for tsx).");
}

// Run the demo
runDemo().catch(console.error);
```
