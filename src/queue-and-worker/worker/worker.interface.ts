// import EventEmitter from "node:events";
import { JobProcessor } from "../job/job-processor.interface";
import { Job } from "../job/job.interface";
import { Queue } from "../queue/queue.interface";

export interface IWorker<T = unknown, R = unknown> {
  start(): Promise<void>;
  stop(): Promise<void>;
  isRunning(): boolean;
}

export class Worker<T = unknown, R extends unknown | void = void>
  implements IWorker<T, R>
{
  private running: boolean = false;

  constructor(
    private readonly queue: Queue<T, R>,
    private readonly processor: JobProcessor<T, R>
  ) {
    if (!queue) throw new Error("Queue is required");
    if (!processor) throw new Error("Processor is required");
  }

  private formatError(err: unknown): string {
    const error = this.parseToError(err);

    return `
      ${error.name}: ${error.message}
      ${error.cause ? `Cause: ${error.cause}` : ""}
      ${error.stack ? `Stack: ${error.stack}` : ""}
    `.trim();
  }

  private parseToError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(`Unexpected error: ${this.safeStringify(error)}`);
  }

  private safeStringify(error: unknown): string {
    try {
      return JSON.stringify(error);
    } catch (jsonError) {
      return JSON.stringify(jsonError);
    }
  }

  async process(job: Job<T, R>): Promise<void> {
    try {
      const result = await this.processor(job);

      if (result !== undefined) {
        await job.complete(result as R);
        return;
      }

      await job.moveToDelay(0);
    } catch (error) {
      const formattedError = this.formatError(error);
      await job.fail(formattedError);
    }
  }

  async start(): Promise<void> {
    if (this.running) return;

    this.running = true;

    while (this.running) {
      const job = await this.queue.getNextJob();
      if (job) {
        await this.process(job);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  async stop(): Promise<void> {
    this.running = false;
  }

  isRunning(): boolean {
    return this.running;
  }
}
