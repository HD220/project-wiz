import { z } from "zod";
import { Job } from "../jobs";

export const QueueSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  concurrency: z.number().int().positive().default(1),
  jobs: z.array(z.instanceof(Job)),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type QueueConstructor = z.infer<typeof QueueSchema>;

export class Queue {
  private fields: QueueConstructor;

  constructor(fields: QueueConstructor) {
    this.fields = QueueSchema.parse(fields);
  }

  get id(): string {
    return this.fields.id;
  }

  get name(): string {
    return this.fields.name;
  }

  get concurrency(): number {
    return this.fields.concurrency;
  }

  get jobs(): Job[] {
    return this.fields.jobs;
  }

  get createdAt(): Date {
    return this.fields.createdAt;
  }

  get updatedAt(): Date {
    return this.fields.updatedAt;
  }

  addJob(job: Job): Queue {
    return new Queue({
      ...this.fields,
      jobs: [...this.fields.jobs, job],
      updatedAt: new Date(),
    });
  }

  getNextJob(): Job | null {
    // Atualiza jobs atrasadas
    this.fields.jobs.forEach((job) => {
      if (job.isDelayCompleted()) job.moveToWaiting();
    });

    // Verifica limite de concorrência
    const activeJobsCount = this.fields.jobs.filter((job) =>
      job.isActive()
    ).length;

    if (activeJobsCount >= this.fields.concurrency) {
      return null;
    }

    // Filtra jobs disponíveis e ordena por:
    // 1. Prioridade (menor número = maior prioridade)
    // 2. Data de criação (mais antigas primeiro)
    const availableJobs = this.fields.jobs
      .filter((job) => job.isWaiting())
      .sort((a, b) => {
        if (a.opts.priority !== b.opts.priority) {
          return a.opts.priority - b.opts.priority;
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    const nextJob = availableJobs[0];
    if (!nextJob) return null;

    // Marca como ativa e atualiza timestamps
    nextJob.moveToActive();
    this.fields.updatedAt = new Date();

    return nextJob;
  }

  markJobAsCompleted(jobId: string, result: unknown): void {
    const job = this.fields.jobs.find((j) => j.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found in queue`);
    }

    if (!job.isActive()) {
      throw new Error(`Job ${jobId} is not in ACTIVE state`);
    }

    job.moveToComplete();
    this.fields.updatedAt = new Date();
  }

  markJobAsFailed(jobId: string, error: Error): void {
    const job = this.fields.jobs.find((j) => j.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found in queue`);
    }

    if (!job.isActive()) {
      throw new Error(`Job ${jobId} is not in ACTIVE state`);
    }

    job.moveToFail(error.message);
    this.fields.updatedAt = new Date();
  }
}
