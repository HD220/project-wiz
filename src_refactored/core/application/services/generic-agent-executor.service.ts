import { Agent } from '@/refactored/core/domain/agent/agent.entity';
import { IAgentInternalStateRepository } from '@/refactored/core/domain/agent/ports/i-agent-internal-state.repository';
import { Job } from '@/refactored/core/domain/job/job.entity';
import { AgentExecutorResult } from '@/refactored/core/domain/job/job-processing.types';
import { IJobRepository } from '@/refactored/core/domain/job/ports/i-job.repository';
import { Result } from '@/refactored/shared/result';
import { DomainError } from '@/refactored/core/common/errors';
import { ApplicationError } from '@/refactored/core/application/common/errors';
import { IAgentExecutor } from '@/refactored/core/application/ports/services/i-agent-executor.interface';
import { ILLMAdapter } from '@/refactored/core/application/ports/adapters/i-llm.adapter';
import { IToolRegistryService } from '@/refactored/core/application/ports/services/i-tool-registry.service';
import { ILogger } from '@/refactored/core/common/services/i-logger.service';

// @Injectable() // Assuming InversifyJS or similar will be used for DI
export class GenericAgentExecutor implements IAgentExecutor {
  constructor(
    private readonly llmAdapter: ILLMAdapter,
    private readonly toolRegistryService: IToolRegistryService,
    private readonly jobRepository: IJobRepository,
    private readonly agentInternalStateRepository: IAgentInternalStateRepository,
    private readonly logger: ILogger, // Added logger
  ) {}

  public async executeJob(
    job: Job,
    agent: Agent,
  ): Promise<Result<AgentExecutorResult, DomainError | ApplicationError>> {
    this.logger.info(
      `Executing Job ID: ${job.id.value} with Agent ID: ${agent.id.value}`,
      { jobId: job.id.value, agentId: agent.id.value },
    );

    try {
      // 1. Retrieve or initialize ActivityHistory
      // For now, we assume ActivityContext and its history are part of the job's props.
      // A more robust approach might involve creating/validating it here.
      const activityContext = job.props.context;
      if (!activityContext) {
        this.logger.error(
          `Job ID: ${job.id.value} is missing activity context.`,
          undefined,
          { jobId: job.id.value },
        );
        return Result.err(
          new ApplicationError(
            `Job ${job.id.value} is missing activity context.`,
          ),
        );
      }
      // ActivityHistory is a value object, so it's immutable.
      // Operations on it will return new instances.
      let currentActivityHistory = activityContext.history;

      // 2. Update Job status to PROCESSING
      // The Job entity should have methods to manage its state transitions.
      const processingJobResult = job.markAsProcessing();
      if (processingJobResult.isErr()) {
        this.logger.error(
          `Failed to mark Job ID: ${job.id.value} as PROCESSING.`,
          processingJobResult.error,
          { jobId: job.id.value },
        );
        return Result.err(processingJobResult.error);
      }

      const updatedJob = processingJobResult.value;

      const saveResult = await this.jobRepository.save(updatedJob);
      if (saveResult.isErr()) {
        this.logger.error(
          `Failed to save Job ID: ${job.id.value} after marking as PROCESSING.`,
          saveResult.error,
          { jobId: job.id.value },
        );
        // Potentially revert job status or handle inconsistency
        return Result.err(saveResult.error);
      }
      this.logger.info(`Job ID: ${job.id.value} marked as PROCESSING and saved.`, {
        jobId: job.id.value,
      });

      // Placeholder for actual execution loop (will be in next sub-tasks)
      // For now, return a result indicating the setup is done and it's pending further LLM interaction.
      // The history passed here would be the initial history.
      const initialAgentJobState = job.props.data || {}; // Or a more structured initial state

      return Result.ok<AgentExecutorResult, DomainError | ApplicationError>({
        jobId: job.id.value,
        status: initialAgentJobState.currentStatus || 'PENDING_LLM_RESPONSE', // Placeholder, actual status from job.props.data.currentStatus
        output: initialAgentJobState.lastMessage || { message: 'Job processing initiated.' },
        history: currentActivityHistory.entries, // Pass the current entries
        errors: [], // No errors at this stage of initialization
        nextAllowedToolCalls: null, // To be determined by LLM
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Unhandled error during initial execution of Job ID: ${job.id.value}.`,
        err,
        { jobId: job.id.value },
      );
      return Result.err(
        new ApplicationError(
          `Unhandled error during execution: ${err.message}`,
        ),
      );
    }
  }
}
