// src/infrastructure/persistence/in-memory/repositories/ai-agent.repository.ts
import { IAIAgentRepository } from '@/domain/repositories/i-ai-agent.repository';
import { AIAgent } from '@/domain/entities/ai-agent.entity';
import { injectable } from 'inversify';

@injectable()
export class InMemoryAIAgentRepository implements IAIAgentRepository {
  private agents: Map<string, AIAgent> = new Map();

  async save(agent: AIAgent): Promise<void> {
    this.agents.set(agent.id, agent);
    console.log(`[InMemoryAIAgentRepository] Agent ${agent.id} saved. Total agents: ${this.agents.size}`);
  }

  async findById(id: string): Promise<AIAgent | null> {
    const agent = this.agents.get(id) || null;
    console.log(`[InMemoryAIAgentRepository] Finding agent by ID ${id}. Found: ${!!agent}`);
    return agent;
  }

  async findByQueueName(queueName: string): Promise<AIAgent | null> {
    for (const agent of this.agents.values()) {
      if (agent.props.queueName === queueName) {
        console.log(`[InMemoryAIAgentRepository] Finding agent by queueName ${queueName}. Found: ${agent.id}`);
        return agent;
      }
    }
    console.log(`[InMemoryAIAgentRepository] Finding agent by queueName ${queueName}. Found: null`);
    return null;
  }

  async findAll(): Promise<AIAgent[]> {
    const allAgents = Array.from(this.agents.values());
    console.log(`[InMemoryAIAgentRepository] Finding all agents. Count: ${allAgents.length}`);
    return allAgents;
  }

  async deleteById(id: string): Promise<void> {
    const deleted = this.agents.delete(id);
    console.log(`[InMemoryAIAgentRepository] Deleting agent by ID ${id}. Deleted: ${deleted}. Total agents: ${this.agents.size}`);
  }
}
