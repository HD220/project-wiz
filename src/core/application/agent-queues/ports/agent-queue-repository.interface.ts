import { JobQueueEntry } from '../domain/job-queue-entry.entity';

export interface IAgentQueueRepository {
  add(agentId: string, jobId: string): Promise<JobQueueEntry>;
  getNextJob(agentId: string): Promise<JobQueueEntry | null>;
  removeJob(agentId: string, jobId: string): Promise<void>;
  getQueueSize(agentId: string): Promise<number>;
  getJobById(agentId: string, jobId: string): Promise<JobQueueEntry | null>;
}

export const IAgentQueueRepository = Symbol('IAgentQueueRepository');
