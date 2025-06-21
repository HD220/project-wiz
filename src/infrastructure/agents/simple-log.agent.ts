// src/infrastructure/agents/simple-log.agent.ts

import { IAgent } from '../../core/ports/agent.interface';
import { Job } from '../../core/domain/entities/jobs/job.entity';
import { SimpleLogTask } from '../tasks/simple-log.task'; // Adjust path as needed

// Assuming the input/output types for the Job payload match SimpleLogTask's Input/Output
type AgentInput = Parameters<SimpleLogTask['execute']>[0];
type AgentOutput = Awaited<ReturnType<SimpleLogTask['execute']>>;

export class SimpleLogAgent implements IAgent<AgentInput, AgentOutput> {
  private simpleLogTask: SimpleLogTask;

  constructor() {
    this.simpleLogTask = new SimpleLogTask();
    console.log('SimpleLogAgent initialized.');
  }

  async process(job: Job<AgentInput, AgentOutput>): Promise<AgentOutput | void> {
    console.log(`SimpleLogAgent: Processing job ID: ${job.id}, Name: ${job.name}`);

    if (!job.payload) {
      // This case should ideally be validated before job creation or by the WorkerService
      // before calling the agent, but good to have a safeguard.
      console.error(`SimpleLogAgent: Job ${job.id} has no payload.`);
      throw new Error(`Job ${job.id} has no payload.`); // Fail the job if payload is essential
    }

    try {
      // The payload of the job is expected to be of AgentInput type
      const taskResult = await this.simpleLogTask.execute(job.payload);
      return taskResult;
    } catch (error) {
      console.error(`SimpleLogAgent: Error executing SimpleLogTask for job ${job.id}:`, error);
      // Re-throw the error to be caught by WorkerService for standard error handling (retry, fail)
      throw error;
    }
  }

  // Example of an agent-specific method, if IAgent had more methods
  // public getName(): string {
  //   return 'SimpleLogAgent';
  // }
}
