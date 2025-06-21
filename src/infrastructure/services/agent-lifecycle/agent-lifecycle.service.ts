// src/infrastructure/services/agent-lifecycle/agent-lifecycle.service.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/ioc/types';
import { IAgentLifecycleService } from '@/domain/services/i-agent-lifecycle.service';
import { IAIAgentRepository } from '@/domain/repositories/i-ai-agent.repository';
import { IJobRepository } from '@/domain/repositories/i-job.repository'; // For QueueClient
import { IAIAgentExecutionService } from '@/domain/services/agent/i-ai-agent-execution.service';
import { ILoggerService } from '@/domain/services/i-logger.service';
import { QueueClient } from '@/infrastructure/queue/queue.client';
import { GenericWorker } from '@/infrastructure/workers/generic.worker';
import { AIAgent } from '@/domain/entities/ai-agent.entity';

@injectable()
export class AgentLifecycleService implements IAgentLifecycleService {
  private workers: Map<string, GenericWorker> = new Map(); // Stores agentId -> worker

  constructor(
    @inject(TYPES.IAIAgentRepository) private aiAgentRepository: IAIAgentRepository,
    @inject(TYPES.IJobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.IAIAgentExecutionService) private aiAgentExecutionService: IAIAgentExecutionService,
    @inject(TYPES.ILoggerService) private logger: ILoggerService
  ) {}

  async initializeAndStartAgents(): Promise<void> {
    this.logger.info('[AgentLifecycleService] Initializing and starting AI agents...');
    try {
      const agents = await this.aiAgentRepository.findAll();
      if (agents.length === 0) {
        this.logger.warn('[AgentLifecycleService] No AI agents found in the repository. No workers will be started.');
        return;
      }

      this.logger.info(`[AgentLifecycleService] Found ${agents.length} agent(s) to initialize.`);

      for (const agent of agents) {
        // The check for agent.props.queueName is no longer needed.
        // The agent's ID is guaranteed to exist.
        if (this.workers.has(agent.id)) {
            this.logger.warn(`[AgentLifecycleService] Worker for agent ${agent.id} (${agent.name}) is already initialized. Skipping.`);
            continue;
        }

        this.logger.info(`[AgentLifecycleService] Initializing agent ${agent.id} (${agent.name}) for its queue (id: '${agent.id}')...`);

        const queueClient = new QueueClient(agent.id, this.jobRepository, this.logger); // Use agent.id as queueName
        const jobProcessor = this.aiAgentExecutionService.getJobProcessorForAgent(agent.id);

        const workerId = `agent-worker-${agent.id}`; // Worker ID can be simplified

        const worker = new GenericWorker(
          workerId,
          queueClient,
          jobProcessor,
          this.logger // Pass the shared logger service
          // Add polling interval from agent config or a global config if needed
        );

        try {
          worker.start();
          this.workers.set(agent.id, worker);
          this.logger.info(`[AgentLifecycleService] Worker for agent ${agent.id} (${agent.name}) started successfully for queue '${agent.id}'.`);
        } catch (startError: any) {
          this.logger.error(`[AgentLifecycleService] Failed to start worker for agent ${agent.id} (${agent.name}): ${startError.message}`, startError.stack);
        }
      }
    } catch (error: any) {
      this.logger.error(`[AgentLifecycleService] Error during agent initialization: ${error.message}`, error.stack);
      // Depending on the error, might want to stop already started workers or handle differently
    }
  }

  async stopAllAgents(): Promise<void> {
    this.logger.info('[AgentLifecycleService] Stopping all AI agent workers...');
    let SucceededCount = 0;
    for (const [agentId, worker] of this.workers.entries()) {
      try {
        await worker.stop();
        this.logger.info(`[AgentLifecycleService] Worker for agent ${agentId} stopped successfully.`);
        SucceededCount++;
      } catch (stopError: any) {
        this.logger.error(`[AgentLifecycleService] Error stopping worker for agent ${agentId}: ${stopError.message}`, stopError.stack);
      }
    }
    this.workers.clear(); // Clear the map after attempting to stop all
    this.logger.info(`[AgentLifecycleService] All agent workers stop process completed. ${SucceededCount} workers stopped successfully.`);
  }
}
