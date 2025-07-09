import { inject, injectable } from 'inversify';
import { IAgentQueueRepository } from '../ports/agent-queue-repository.interface';
import { JobQueueEntry } from '../domain/job-queue-entry.entity';

@injectable()
export class AgentQueueService {
  constructor(
    @inject(IAgentQueueRepository) private readonly agentQueueRepository: IAgentQueueRepository
  ) {}

  async enqueue(agentId: string, jobId: string): Promise<JobQueueEntry> {
    // Basic validation
    if (!agentId || !jobId) {
      throw new Error('Agent ID and Job ID are required to enqueue.');
    }
    return this.agentQueueRepository.add(agentId, jobId);
  }

  async dequeue(agentId: string): Promise<JobQueueEntry | null> {
    if (!agentId) {
      throw new Error('Agent ID is required to dequeue.');
    }
    const nextJobEntry = await this.agentQueueRepository.getNextJob(agentId);
    if (nextJobEntry) {
      await this.agentQueueRepository.removeJob(agentId, nextJobEntry.jobId);
      return nextJobEntry;
    }
    return null;
  }

  async getQueueSize(agentId: string): Promise<number> {
    if (!agentId) {
      throw new Error('Agent ID is required to get queue size.');
    }
    return this.agentQueueRepository.getQueueSize(agentId);
  }

  async getJobById(agentId: string, jobId: string): Promise<JobQueueEntry | null> {
    if (!agentId || !jobId) {
      throw new Error('Agent ID and Job ID are required to get job by ID.');
    }
    return this.agentQueueRepository.getJobById(agentId, jobId);
  }

  // Potentially, a method to peek at the next job without dequeuing
  async peekNextJob(agentId: string): Promise<JobQueueEntry | null> {
    if (!agentId) {
      throw new Error('Agent ID is required to peek next job.');
    }
    return this.agentQueueRepository.getNextJob(agentId);
  }
}
