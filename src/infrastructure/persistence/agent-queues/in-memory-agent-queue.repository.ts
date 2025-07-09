import { injectable } from 'inversify';
import { JobQueueEntry } from '@/core/application/agent-queues/domain/job-queue-entry.entity';
import { IAgentQueueRepository } from '@/core/application/agent-queues/ports/agent-queue-repository.interface';

@injectable()
export class InMemoryAgentQueueRepository implements IAgentQueueRepository {
  private queues: Map<string, JobQueueEntry[]> = new Map();

  async add(agentId: string, jobId: string): Promise<JobQueueEntry> {
    if (!this.queues.has(agentId)) {
      this.queues.set(agentId, []);
    }
    const queue = this.queues.get(agentId)!;
    // Check if job already exists in queue for this agent
    const existingEntry = queue.find(entry => entry.jobId === jobId);
    if (existingEntry) {
      // Optionally, update timestamp or handle as an error/ignore
      // For now, just return the existing entry
      return existingEntry;
    }
    const newEntry = new JobQueueEntry(agentId, jobId);
    queue.push(newEntry);
    return newEntry;
  }

  async getNextJob(agentId: string): Promise<JobQueueEntry | null> {
    const queue = this.queues.get(agentId);
    if (queue && queue.length > 0) {
      return queue[0]; // Return the oldest job (FIFO)
    }
    return null;
  }

  async removeJob(agentId: string, jobId: string): Promise<void> {
    const queue = this.queues.get(agentId);
    if (queue) {
      const index = queue.findIndex(entry => entry.jobId === jobId);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    }
  }

  async getQueueSize(agentId: string): Promise<number> {
    const queue = this.queues.get(agentId);
    return queue ? queue.length : 0;
  }

  async getJobById(agentId: string, jobId: string): Promise<JobQueueEntry | null> {
    const queue = this.queues.get(agentId);
    if (queue) {
      return queue.find(entry => entry.jobId === jobId) || null;
    }
    return null;
  }
}
