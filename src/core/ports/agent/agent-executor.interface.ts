// src/core/ports/agent/agent-executor.interface.ts
import { Job } from '../../domain/entities/jobs/job.entity';
import { AgentPersonaTemplate } from '../../domain/entities/agent/persona-template.types';
import { AgentExecutorResult } from '../../domain/jobs/job-processing.types';

export interface IAgentExecutor {
  processJob(job: Job<any, any>): Promise<AgentExecutorResult>;
    // 'toolRegistry' or specific tools are NOT passed here;
    // The concrete implementation in infra will handle tool access,
    // and the executor instance will be pre-configured with a persona.
}
