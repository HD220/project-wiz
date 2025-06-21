// src/infrastructure/agents/summarization.agent.ts
import { IAgent } from '../../core/ports/agent.interface';
import { Job } from '../../core/domain/entities/jobs/job.entity';
import { SummarizationTask } from '../tasks/summarization.task';

export class SummarizationAgent implements IAgent<string, string> {
  readonly name = 'SummarizationAgent';
  private summarizationTask: SummarizationTask;

  constructor() {
    this.summarizationTask = new SummarizationTask();
    // In a more complex agent, tools or other services might be injected here
  }

  async process(job: Job<string, string>): Promise<string | void> {
    console.log(`${this.name}: Processing job ${job.id} with name ${job.name}`);

    if (!job.payload) {
      console.error(`${this.name}: Job ${job.id} has no payload.`);
      throw new Error(`Job ${job.id} is missing payload for SummarizationAgent.`);
    }

    // Assuming the payload is directly the string to be summarized.
    // If job.payload is an object like { textToSummarize: "..." },
    // then access it accordingly: job.payload.textToSummarize
    const textToSummarize = job.payload as string;

    try {
      const summary = await this.summarizationTask.execute(textToSummarize);

      if (summary) {
        console.log(`${this.name}: Job ${job.id} completed successfully. Summary: "${summary}"`);
        return summary;
      } else {
        console.warn(`${this.name}: Job ${job.id} resulted in no summary from the task. Needs re-evaluation.`);
        // This 'void' return will typically result in the job being rescheduled or marked as needing attention,
        // depending on the WorkerService's handling of void returns (as per docs/arquitetura.md, it should be re-queued with delay).
        return;
      }
    } catch (error) {
      console.error(`${this.name}: Error processing job ${job.id}:`, error);
      // Re-throw the error so the WorkerService can handle job failure/retries
      throw error;
    }
  }
}
