import { FQueue } from "./interfaces/fqueue.interface";
import { Job, JobStatus } from "./interfaces/job.interface";
import { Agent } from "./agent";

export class Worker {
  private isRunning = false;
  private currentJob: Job | null = null;

  constructor(
    private queue: FQueue,
    private agent: Agent,
    private agentId: string,
    private pollInterval: number = 1000
  ) {}

  async start(): Promise<void> {
    this.isRunning = true;
    while (this.isRunning) {
      try {
        await this.processNextJob();
      } catch (error) {
        console.error("Error processing job:", error);
      }
      await new Promise((resolve) => setTimeout(resolve, this.pollInterval));
    }
  }

  stop(): void {
    this.isRunning = false;
  }

  private async processNextJob(): Promise<void> {
    if (this.currentJob) return;

    this.currentJob = await this.queue.getNextJob(this.agentId);
    if (!this.currentJob) return;

    try {
      await this.queue.updateJobStatus(this.currentJob.id, "executing");

      const result = await this.agent.process(this.currentJob);

      if (result === undefined) {
        // Job needs to be continued later
        await this.queue.updateJobStatus(this.currentJob.id, "waiting");
      } else {
        // Job completed successfully
        await this.queue.updateJobStatus(this.currentJob.id, "success", result);
      }
    } catch (error) {
      await this.queue.updateJobStatus(
        this.currentJob.id,
        "failed",
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      this.currentJob = null;
    }
  }

  get status() {
    return {
      isRunning: this.isRunning,
      currentJob: this.currentJob,
    };
  }
}
