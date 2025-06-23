import { Agent } from '@/refactored/core/domain/agent/agent.entity';
import { IAgentInternalStateRepository } from '@/refactored/core/domain/agent/ports/i-agent-internal-state.repository';
import { Job } from '@/refactored/core/domain/job/job.entity';
import { JobStatusType } from '@/refactored/core/domain/job/value-objects/job-status.vo';
import { AgentExecutorResult } from '@/refactored/core/domain/job/job-processing.types';
import { IJobRepository } from '@/refactored/core/domain/job/ports/i-job.repository';
// Corrected import: ok, error are named exports, Result is a type
import { ok, error, Result } from '@/refactored/shared/result';
import { DomainError } from '@/refactored/core/common/errors';
import { HistoryEntryRoleType, ActivityHistoryEntry } from '@/refactored/core/domain/job/value-objects/activity-history-entry.vo';
import { ApplicationError } from '@/refactored/core/application/common/errors';
import { IAgentExecutor } from '@/refactored/core/application/ports/services/i-agent-executor.interface';
import { ILLMAdapter } from '@/refactored/core/application/ports/adapters/i-llm.adapter';
import { IToolRegistryService } from '@/refactored/core/application/ports/services/i-tool-registry.service';
import { ILogger } from '@/refactored/core/common/services/i-logger.service';
import { ActivityHistory } from '@/refactored/core/domain/job/value-objects/activity-history.vo';

// Define LanguageModelMessage (standard for Vercel AI SDK)
// TODO: Move to a shared types location if not already present
interface LanguageModelMessageToolCall {
  id: string;
  type: 'function'; // Currently, only 'function' is common
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

interface LanguageModelMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null; // Content can be null, e.g., for assistant messages with only tool_calls
  tool_calls?: LanguageModelMessageToolCall[]; // For assistant role
  tool_call_id?: string; // For tool role
}


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
      // 1. Ensure AgentState and ActivityHistory are initialized
      let agentState = job.currentData().agentState;
      if (!agentState || !agentState.conversationHistory) {
        this.logger.info(
          `Job ID: ${job.id().value()} is missing agentState or conversationHistory. Initializing.`,
          { jobId: job.id().value() },
        );
        agentState = {
          conversationHistory: ActivityHistory.create([]),
          executionHistory: agentState?.executionHistory || [], // Preserve execution history if it exists
          // currentGoal: job.name().value(), // Optionally initialize currentGoal
        };
        job.updateAgentState(agentState);
        // Note: This modification to job should ideally be saved before proceeding,
        // or the job instance passed around should be the updated one.
        // For now, we assume jobRepository.save below will persist this if changed.
      }
      let currentActivityHistory = agentState.conversationHistory;


      // 2. Update Job status to PROCESSING (or ACTIVE)
      const jobStatusUpdateResult = this.updateJobToActiveStatus(job);
      if (jobStatusUpdateResult.isErr()) {
        return error(jobStatusUpdateResult.error);
      }

      // Save the job now that its state (potentially agentState and status) has been updated.
      const saveResult = await this.jobRepository.save(job);
      if (saveResult.isErr()) {
        this.logger.error(
          `Failed to save Job ID: ${job.id().value} after initial updates.`,
          saveResult.error,
          { jobId: job.id().value() },
        );
        return error(saveResult.error);
      }
      this.logger.info(`Job ID: ${job.id().value} is ACTIVE and saved. Attempt: ${job.attempts().value()}`, {
        jobId: job.id().value(),
        status: job.status().value(),
        attempts: job.attempts().value(),
      });

      // 3. Construct initial messages for LLM and update history if needed
      const messageConstructionResult = this.constructInitialLlmMessagesAndUpdateHistory(
        agent,
        job,
        currentActivityHistory
      );
      let conversationMessages = messageConstructionResult.messages;
      currentActivityHistory = messageConstructionResult.updatedHistory; // Update history reference

      // If history was updated (e.g., initial user prompt added), update agentState on Job
      if (messageConstructionResult.historyWasUpdated) {
        job.updateAgentState({
           ...agentState!, // Non-null assertion safe due to earlier check/init
           conversationHistory: currentActivityHistory
        });
        // Consider if a save is needed here or if it's batched later.
        // For now, the instance of 'job' carries the updated state.
      }

      // 4. Start interaction loop (simplified for this sub-task: one call)
      let goalAchieved = false; // Renamed from isGoalAchieved for consistency
      let maxIterations = 5;
      let llmResponseText = 'No response yet.';

      if (maxIterations <= 0 || goalAchieved) {
        // Should not happen with current simplified loop, but good check for future.
         return this.createFinalResult(job, llmResponseText, goalAchieved);
      }

      this.logLlmCall(job, conversationMessages);

      const agentTemperature = agent.temperature();
      const llmGenerationResult = await this.llmAdapter.generateText(
          conversationMessages.map(m => `${m.role}: ${m.content}`).join('\n\n'),
          { temperature: agentTemperature.value() }
      );

      if (llmGenerationResult.isErr()) {
        const llmError = llmGenerationResult.error;
        this.logger.error(`LLM generation failed for Job ID: ${job.id().value()}`, llmError, { jobId: job.id().value() });
        return error(new ApplicationError(`LLM generation failed: ${llmError.message}`));
      }

      llmResponseText = llmGenerationResult.value;
      this.logger.info(`LLM response received for Job ID: ${job.id().value()}: ${llmResponseText.substring(0,100)}...`, { jobId: job.id().value() });

      // Update history with LLM's response
      const assistantEntry = ActivityHistoryEntry.create(
        HistoryEntryRoleType.ASSISTANT,
        llmResponseText
      );
      currentActivityHistory = currentActivityHistory.addEntry(assistantEntry);

      // Update agentState on the job instance
      // Note: agentState was already confirmed to exist earlier in the method.
      job.updateAgentState({
        ...agentState!, // Non-null assertion safe due to earlier check/init
        conversationHistory: currentActivityHistory
      });
      // The job with updated agentState will be saved by the worker service after executeJob completes,
      // or if further iterations/tool calls happen, it's saved before those.
      // For this sub-task, we are not saving it here within the loop's first pass.

      goalAchieved = this.isGoalAchievedByLlmResponse(llmResponseText);
      // maxIterations--; // Loop is only one iteration for this sub-task and next.

      return this.createFinalResult(job, llmResponseText, goalAchieved);

    } catch (caughtError) {
      const errorObject = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
      this.logger.error(
        `Unhandled error during LLM interaction for Job ID: ${job.id().value()}.`,
        errorObject,
        { jobId: job.id.value },
      );
      return error(
        new ApplicationError(
          `Unhandled error during execution: ${errorObject.message}`,
        ),
      );
    }
  }

  private updateJobToActiveStatus(job: Job): Result<void, ApplicationError> {
    if (job.moveToActive()) {
      return ok(undefined);
    }
    // This case should be rare if job is fetched correctly by worker
    this.logger.warn(
      `Job ID: ${job.id().value} could not be moved to ACTIVE state. Current status: ${job.status().value()}`,
      { jobId: job.id().value(), currentStatus: job.status().value() },
    );
    // Depending on policy, might return error or try to proceed if already active.
    // For now, if it's not already active and cannot be moved, it's an issue.
    if (!job.status().is(JobStatusType.ACTIVE)) {
        return error(new ApplicationError(`Job ${job.id().value()} could not be set to ACTIVE.`));
    }
    return ok(undefined); // Already active, proceed.
  }

  private constructInitialLlmMessagesAndUpdateHistory(
    agent: Agent,
    job: Job,
    initialHistory: ActivityHistory,
  ): { messages: LanguageModelMessage[]; updatedHistory: ActivityHistory; historyWasUpdated: boolean } {
    const persona = agent.personaTemplate();
    const personaName = persona.name().value();
    const personaRole = persona.role().value();
    const personaGoal = persona.goal().value();
    const personaBackstory = persona.backstory().value();

    const systemMessageContent = `You are ${personaName}, a ${personaRole}. Your goal is: ${personaGoal}. Persona backstory: ${personaBackstory}`;

    const messages: LanguageModelMessage[] = [{ role: 'system', content: systemMessageContent }];
    let historyWasUpdated = false;
    let workingHistory = initialHistory;

    if (!workingHistory.isEmpty()) {
      workingHistory.entries().forEach(entry => {
        messages.push({
          role: entry.role() as 'system' | 'user' | 'assistant' | 'tool',
          content: entry.content(),
        });
      });
    } else {
      const jobPayload = job.payload() as { prompt?: string; [key: string]: any };
      const jobName = job.name().value();
      const userPromptContent = jobPayload.prompt || `Based on your persona, please address the following task: ${jobName}`;

      messages.push({ role: 'user', content: userPromptContent });

      // Add this initial user prompt to the history
      const userPromptEntry = ActivityHistoryEntry.create(HistoryEntryRoleType.USER, userPromptContent);
      workingHistory = workingHistory.addEntry(userPromptEntry);
      historyWasUpdated = true;
    }

    return { messages, updatedHistory: workingHistory, historyWasUpdated };
  }

  private isGoalAchievedByLlmResponse(responseText: string): boolean {
    // Basic placeholder for goal achievement
    return responseText.toLowerCase().includes("task complete");
  }

  private logLlmCall(job: Job, messages: LanguageModelMessage[]): void {
    const jobIdVo = job.id();
    const attemptsVo = job.attempts();
    this.logger.info(`Calling LLM for Job ID: ${jobIdVo.value()}. Attempt ${attemptsVo.value()}`, {
      jobId: jobIdVo.value(),
      messages: messages.map(m => ({role: m.role, content: m.content.substring(0, 100) + '...'})),
    });
  }

  private createFinalResult(
    job: Job,
    llmResponseText: string,
    goalAchieved: boolean
  ): Result<AgentExecutorResult, DomainError | ApplicationError> {
    const finalAgentJobState = job.currentData().agentState || {
      conversationHistory: ActivityHistory.create([]),
      executionHistory: []
    };
    const jobIdVo = job.id();

    return ok<AgentExecutorResult, DomainError | ApplicationError>({
      jobId: jobIdVo.value(),
      status: goalAchieved ? 'COMPLETED_SUCCESS' : 'PENDING_LLM_RESPONSE',
      output: { message: llmResponseText },
      history: finalAgentJobState.conversationHistory.entries(),
      errors: [],
      nextAllowedToolCalls: null,
    });
  }
}
