import { randomUUID } from 'node:crypto';

export class JobQueueEntry {
  public readonly id: string;
  public readonly agentId: string;
  public readonly jobId: string;
  public readonly createdAt: Date;

  constructor(agentId: string, jobId: string) {
    this.id = randomUUID();
    this.agentId = agentId;
    this.jobId = jobId;
    this.createdAt = new Date();
  }
}
