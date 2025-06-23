import { mock, MockProxy } from 'vitest-mock-extended';
import { GenericAgentExecutor } from './generic-agent-executor.service';
import { ILLMAdapter } from '@/refactored/core/application/ports/adapters/i-llm.adapter';
import { IToolRegistryService } from '@/refactored/core/application/ports/services/i-tool-registry.service';
import { IJobRepository } from '@/refactored/core/domain/job/ports/i-job.repository';
import { IAgentInternalStateRepository } from '@/refactored/core/domain/agent/ports/i-agent-internal-state.repository';
import { ILogger } from '@/refactored/core/common/services/i-logger.service';
import { Job } from '@/refactored/core/domain/job/job.entity';
import { Agent } from '@/refactored/core/domain/agent/agent.entity';
import { JobId } from '@/refactored/core/domain/job/value-objects/job-id.vo';
import { JobName } from '@/refactored/core/domain/job/value-objects/job-name.vo';
import { AgentId } from '@/refactored/core/domain/agent/value-objects/agent-id.vo';
// Corrected import: ok, error, Result (as type)
import { ok, error, Result } from '@/refactored/shared/result';
import { ApplicationError } from '@/refactored/core/application/common/errors';
import { ActivityContext } from '@/refactored/core/domain/job/value-objects/activity-context.vo';
import { ActivityHistory } from '@/refactored/core/domain/job/value-objects/activity-history.vo';
import { AgentPersonaTemplate } from '@/refactored/core/domain/agent/agent-persona-template.vo';
import { PersonaId } from '@/refactored/core/domain/agent/value-objects/persona/persona-id.vo';
import { PersonaName } from '@/refactored/core/domain/agent/value-objects/persona/persona-name.vo';
import { PersonaRole } from '@/refactored/core/domain/agent/value-objects/persona/persona-role.vo';
import { PersonaGoal } from '@/refactored/core/domain/agent/value-objects/persona/persona-goal.vo';
import { PersonaBackstory } from '@/refactored/core/domain/agent/value-objects/persona/persona-backstory.vo';
import { ToolNames } from '@/refactored/core/domain/agent/value-objects/persona/tool-names.vo';
import { LLMProviderConfig } from '@/refactored/core/domain/llm-provider-config/llm-provider-config.entity';
import { LLMProviderConfigId } from '@/refactored/core/domain/llm-provider-config/value-objects/llm-provider-config-id.vo';
import { LLMProviderConfigName } from '@/refactored/core/domain/llm-provider-config/value-objects/llm-provider-config-name.vo';
import { LLMProviderId } from '@/refactored/core/domain/llm-provider-config/value-objects/llm-provider-id.vo';
import { LLMApiKey } from '@/refactored/core/domain/llm-provider-config/value-objects/llm-api-key.vo';
import { AgentTemperature } from '@/refactored/core/domain/agent/value-objects/agent-temperature.vo';
import { JobStatusType } from '@/refactored/core/domain/job/value-objects/job-status.vo';
import { LLMError } from '@/refactored/core/common/errors';
import { HistoryEntryRoleType } from '@/refactored/core/domain/job/value-objects/activity-history-entry.vo';


describe('GenericAgentExecutor', () => {
  let executor: GenericAgentExecutor;
  let mockLlmAdapter: MockProxy<ILLMAdapter>;
  let mockToolRegistryService: MockProxy<IToolRegistryService>;
  let mockJobRepository: MockProxy<IJobRepository>;
  let mockAgentInternalStateRepository: MockProxy<IAgentInternalStateRepository>;
  let mockLogger: MockProxy<ILogger>;

  let sampleJob: Job;
  let sampleAgent: Agent;

  beforeEach(() => {
    mockLlmAdapter = mock<ILLMAdapter>();
    mockToolRegistryService = mock<IToolRegistryService>();
    mockJobRepository = mock<IJobRepository>();
    mockAgentInternalStateRepository = mock<IAgentInternalStateRepository>();
    mockLogger = mock<ILogger>();

    executor = new GenericAgentExecutor(
      mockLlmAdapter,
      mockToolRegistryService,
      mockJobRepository,
      mockAgentInternalStateRepository,
      mockLogger,
    );

    // Create a sample Job
    sampleJob = Job.create({
      name: JobName.create('Test Job Prompt').value,
      payload: { initialPrompt: 'Initial user query for the job' },
    });
    // Spy on job methods AFTER instance creation
    vi.spyOn(sampleJob, 'moveToActive').mockReturnValue(true);
    vi.spyOn(sampleJob, 'updateAgentState').mockReturnThis();


    // Create a sample LLMProviderConfig
    const llmConfig = LLMProviderConfig.create({
        name: LLMProviderConfigName.create('TestLLMConfig').value,
        providerId: LLMProviderId.create('test-provider').value,
        apiKey: LLMApiKey.create('test-key').value,
    });

    // Create a sample Agent
    const personaTemplateResult = AgentPersonaTemplate.create({
      id: PersonaId.generate(),
      name: PersonaName.create('Test Persona').value,
      role: PersonaRole.create('Tester').value,
      goal: PersonaGoal.create('Test things').value,
      backstory: PersonaBackstory.create('Created for testing').value,
      toolNames: ToolNames.create([]).value,
    });
    if(personaTemplateResult.isErr()) throw personaTemplateResult.error; // Should not happen in test setup

    sampleAgent = Agent.create({
      personaTemplate: personaTemplateResult.value,
      llmProviderConfig: llmConfig, // Use the created LLMProviderConfig
      temperature: AgentTemperature.create(0.7).value,
    });

    mockJobRepository.save.mockResolvedValue(ok(undefined));
    mockLlmAdapter.generateText.mockResolvedValue(ok('LLM initial response'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(executor).toBeDefined();
  });

  describe('executeJob', () => {
    it('should log the start of job execution, set job to active, save job, and call LLM', async () => {
      await executor.executeJob(sampleJob, sampleAgent);

      expect(mockLogger.info).toHaveBeenCalledWith(
        `Executing Job ID: ${sampleJob.id().value} with Agent ID: ${sampleAgent.id().value}`,
        { jobId: sampleJob.id().value, agentId: sampleAgent.id().value },
      );
      expect(sampleJob.moveToActive).toHaveBeenCalled();
      expect(mockJobRepository.save).toHaveBeenCalledWith(sampleJob);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Job ID: ${sampleJob.id().value()} is ACTIVE and saved. Attempt: ${sampleJob.attempts().value()}`,
        expect.anything(),
      );
      expect(mockLlmAdapter.generateText).toHaveBeenCalled();
      expect(sampleJob.updateAgentState).toHaveBeenCalled(); // Called for assistant response
    });

    it('should initialize agentState and add initial user prompt to history if not present, then save job and call LLM', async () => {
      // Create a job explicitly without agentState or with empty history
      const jobWithEmptyHistory = Job.create({
        name: JobName.create('Job needing agentState init').value,
        payload: { prompt: 'init me' },
      });
      // Ensure agentState is undefined or history is empty to trigger initialization logic
      const initialAgentState = jobWithEmptyHistory.currentData().agentState;
      if (initialAgentState && !initialAgentState.conversationHistory.isEmpty()) {
         // If Job.create already makes a non-empty history, clear it for this test.
        (jobWithEmptyHistory as any).props.data.agentState.conversationHistory = ActivityHistory.create([]);
      } else if (!initialAgentState) {
        (jobWithEmptyHistory as any).props.data.agentState = undefined;
      }


      vi.spyOn(jobWithEmptyHistory, 'moveToActive').mockReturnValue(true);
      const updateAgentStateSpy = vi.spyOn(jobWithEmptyHistory, 'updateAgentState').mockReturnThis();

      const llmResponse = 'LLM response after init';
      mockLlmAdapter.generateText.mockResolvedValue(ok(llmResponse));

      await executor.executeJob(jobWithEmptyHistory, sampleAgent);

      // First call to updateAgentState: Initializing agentState if it was undefined
      // Second call (or first if agentState was defined but history empty): For adding initial user prompt
      // Third call: For adding assistant's response
      expect(updateAgentStateSpy).toHaveBeenCalledTimes(initialAgentState?.conversationHistory.isEmpty() || !initialAgentState ? 2 : 1);


      const firstCallArgs = updateAgentStateSpy.mock.calls[0][0];
      expect(firstCallArgs.conversationHistory.count()).toBe(1); // Initial user prompt
      expect(firstCallArgs.conversationHistory.entries()[0].role()).toBe(HistoryEntryRoleType.USER);

      const secondCallArgs = updateAgentStateSpy.mock.calls[1][0];
      expect(secondCallArgs.conversationHistory.count()).toBe(2); // User + Assistant
      expect(secondCallArgs.conversationHistory.entries()[1].role()).toBe(HistoryEntryRoleType.ASSISTANT);
      expect(secondCallArgs.conversationHistory.entries()[1].content()).toBe(llmResponse);

      expect(mockJobRepository.save).toHaveBeenCalledWith(jobWithEmptyHistory);
      expect(mockLlmAdapter.generateText).toHaveBeenCalled();
    });

    it('should construct initial prompt with system message, existing history, and call LLM', async () => {
      // Prepare a job with pre-existing history
      const userEntry = ActivityHistoryEntry.create(HistoryEntryRoleType.USER, 'Existing user message');
      const assistantEntry = ActivityHistoryEntry.create(HistoryEntryRoleType.ASSISTANT, 'Existing assistant response');
      const preExistingHistory = ActivityHistory.create([userEntry, assistantEntry]);

      sampleJob.updateAgentState({
        conversationHistory: preExistingHistory,
        executionHistory: [],
      });
      vi.spyOn(sampleJob, 'updateAgentState').mockReturnThis(); // Re-spy after manual update

      const persona = sampleAgent.personaTemplate();
      const expectedSystemContent = `You are ${persona.name().value()}, a ${persona.role().value()}. Your goal is: ${persona.goal().value()}. Persona backstory: ${persona.backstory().value()}`;

      const expectedFullPrompt =
        `system: ${expectedSystemContent}\n\n` +
        `user: Existing user message\n\n` +
        `assistant: Existing assistant response`;

      mockLlmAdapter.generateText.mockResolvedValue(ok('New LLM Response')); // Ensure LLM mock for this path

      await executor.executeJob(sampleJob, sampleAgent);

      expect(mockLlmAdapter.generateText).toHaveBeenCalledWith(
        expectedFullPrompt,
        { temperature: sampleAgent.temperature().value() }
      );

      const updateAgentStateSpy = vi.mocked(sampleJob.updateAgentState); // Use vi.mocked to get typed spy
      const lastCall = updateAgentStateSpy.mock.calls[updateAgentStateSpy.mock.calls.length - 1];
      const lastCallArgs = lastCall[0];

      expect(lastCallArgs.conversationHistory.count()).toBe(3); // user + assistant + new assistant
      expect(lastCallArgs.conversationHistory.entries()[2].role()).toBe(HistoryEntryRoleType.ASSISTANT);
      expect(lastCallArgs.conversationHistory.entries()[2].content()).toBe('New LLM Response');
    });

    it('should add assistant response to history and update agent state', async () => {
      const llmResponse = 'Test LLM response for history';
      mockLlmAdapter.generateText.mockResolvedValue(ok(llmResponse));
      // sampleJob by default has empty history from beforeEach
      const updateAgentStateSpy = vi.mocked(sampleJob.updateAgentState);

      await executor.executeJob(sampleJob, sampleAgent);

      // Call 1: For initial user prompt (since history is empty)
      // Call 2: For assistant's response
      expect(updateAgentStateSpy).toHaveBeenCalledTimes(2);

      const assistantResponseCallArgs = updateAgentStateSpy.mock.calls[1][0];
      const historyInState = assistantResponseCallArgs.conversationHistory;

      expect(historyInState.count()).toBe(2); // Initial User + Assistant
      expect(historyInState.entries()[1].role()).toBe(HistoryEntryRoleType.ASSISTANT);
      expect(historyInState.entries()[1].content()).toBe(llmResponse);
    });

    it('should construct initial prompt with system and user message from job name if payload prompt missing and history empty', async () => {
      const jobWithoutPayloadPrompt = Job.create({
        name: JobName.create('Job Name As Prompt').value,
        payload: {}, // No 'prompt' field in payload
      });
       // Ensure agentState is undefined or history is empty
      (jobWithoutPayloadPrompt as any).props.data.agentState = {
        conversationHistory: ActivityHistory.create([]),
        executionHistory: [],
      };
      vi.spyOn(jobWithoutPayloadPrompt, 'moveToActive').mockReturnValue(true);
      vi.spyOn(jobWithoutPayloadPrompt, 'updateAgentState').mockReturnThis();


      const persona = sampleAgent.personaTemplate();
      const expectedSystemContent = `You are ${persona.name().value()}, a ${persona.role().value()}. Your goal is: ${persona.goal().value()}. Persona backstory: ${persona.backstory().value()}`;
      const expectedUserContent = `Based on your persona, please address the following task: ${jobWithoutPayloadPrompt.name().value()}`;
      const jobPayload = sampleJob.payload() as { initialPrompt?: string };
      const expectedUserContent = jobPayload.initialPrompt || `Based on your persona, please address the following task: ${sampleJob.name().value()}`;

      const expectedFullPrompt = `system: ${expectedSystemContent}\n\nuser: ${expectedUserContent}`;

      await executor.executeJob(sampleJob, sampleAgent);

      expect(mockLlmAdapter.generateText).toHaveBeenCalledWith(
        expectedFullPrompt,
        { temperature: sampleAgent.temperature().value() }
      );
    });

    it('should return Ok result with LLM response on successful execution', async () => {
      const llmResponse = 'Successful LLM response';
      mockLlmAdapter.generateText.mockResolvedValue(ok(llmResponse));

      const result = await executor.executeJob(sampleJob, sampleAgent);

      expect(result.isOk()).toBe(true);
      const value = result.value;
      expect(value.jobId).toBe(sampleJob.id().value);
      expect(value.output).toEqual({ message: llmResponse });
      expect(value.status).toBe('PENDING_LLM_RESPONSE'); // Simplified status for now
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('LLM response received'),
        expect.anything()
      );
    });

    it('should return Error result if moveToActive fails', async () => {
      vi.spyOn(sampleJob, 'moveToActive').mockReturnValue(false);
      // To ensure it doesn't proceed if already active, let's mock status
      vi.spyOn(sampleJob, 'status').mockReturnValue(JobStatusType.PENDING);


      const result = await executor.executeJob(sampleJob, sampleAgent);

      expect(result.isErr()).toBe(true);
      expect(result.error).toBeInstanceOf(ApplicationError);
      expect(result.error?.message).toContain('could not be set to ACTIVE');
      expect(mockJobRepository.save).not.toHaveBeenCalled();
      expect(mockLlmAdapter.generateText).not.toHaveBeenCalled();
    });

    it('should return Error result if job repository save fails after moveToActive', async () => {
      const dbError = new ApplicationError('DB save failed');
      mockJobRepository.save.mockResolvedValue(error(dbError));

      const result = await executor.executeJob(sampleJob, sampleAgent);

      expect(result.isErr()).toBe(true);
      expect(result.error).toBe(dbError);
      expect(mockLlmAdapter.generateText).not.toHaveBeenCalled();
    });

    it('should return Error result if LLM adapter fails', async () => {
      const llmError = new LLMError('LLM generation failed');
      mockLlmAdapter.generateText.mockResolvedValue(error(llmError));

      const result = await executor.executeJob(sampleJob, sampleAgent);

      expect(result.isErr()).toBe(true);
      expect(result.error).toBeInstanceOf(ApplicationError);
      expect(result.error?.message).toContain('LLM generation failed: LLM generation failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        `LLM generation failed for Job ID: ${sampleJob.id().value()}`,
        llmError,
        { jobId: sampleJob.id().value() }
      );
    });
  });
});
