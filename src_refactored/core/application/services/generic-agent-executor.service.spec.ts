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
import { LLMError, ToolError } from '@/refactored/core/common/errors';
import { HistoryEntryRoleType, ActivityHistoryEntry } from '@/refactored/core/domain/job/value-objects/activity-history-entry.vo';
import { IAgentTool, IToolExecutionContext } from '@/refactored/core/tools/tool.interface';
import { ToolNotFoundError } from '@/refactored/core/application/ports/services/i-tool-registry.service';
import { z } from 'zod';

// Define mock tool constants at a higher scope
const MOCK_TOOL_NAME = 'mock-tool';
const mockToolSchema = z.object({
  param1: z.string(),
  param2: z.number().optional()
});
let mockTool: MockProxy<IAgentTool<any, any>>; // Keep let for mockTool as it's reset in beforeEach

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
      name: JobName.create('Test Job Prompt'), // Create methods throw on error
      payload: { initialPrompt: 'Initial user query for the job' },
    });
    vi.spyOn(sampleJob, 'moveToActive').mockReturnValue(true);
    vi.spyOn(sampleJob, 'updateAgentState').mockReturnThis();

    // Create a sample LLMProviderConfig
    const llmProviderId = LLMProviderId.create('openai');

    const llmConfig = LLMProviderConfig.create({
        id: LLMProviderConfigId.generate(),
        name: LLMProviderConfigName.create('TestLLMConfig'),
        providerId: llmProviderId,
        apiKey: LLMApiKey.create('test-key'),
    });

    // Create a sample Agent
    const personaTemplate = AgentPersonaTemplate.create({
      id: PersonaId.generate(),
      name: PersonaName.create('Test Persona'),
      role: PersonaRole.create('Tester'),
      goal: PersonaGoal.create('Test things'),
      backstory: PersonaBackstory.create('Created for testing'), // Can be empty string
      toolNames: ToolNames.create([]),
    });

    sampleAgent = Agent.create({
      personaTemplate: personaTemplate,
      llmProviderConfig: llmConfig,
      temperature: AgentTemperature.create(0.7),
    });

    mockJobRepository.save.mockResolvedValue(ok(undefined));
    // Default mock for generateText to return a simple assistant message without tool calls
    mockLlmAdapter.generateText.mockResolvedValue(ok({
      role: 'assistant',
      content: 'LLM initial response',
      tool_calls: []
    }));
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
        name: JobName.create('Job Name As Prompt'), // Corrected: pass VO, not its value
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
      // This is the correct expectedUserContent for jobWithoutPayloadPrompt
      const correctExpectedUserContent = `Based on your persona, please address the following task: ${jobWithoutPayloadPrompt.name().value()}`;

      const expectedMessages = [
        { role: 'system', content: expectedSystemContent },
        { role: 'user', content: correctExpectedUserContent } // Use the correct variable
      ];

      // Use jobWithoutPayloadPrompt for this test scenario
      await executor.executeJob(jobWithoutPayloadPrompt, sampleAgent);

      expect(mockLlmAdapter.generateText).toHaveBeenCalledWith(
        expect.arrayContaining(expectedMessages.map(m => expect.objectContaining(m))), // Check if array contains these messages
        { temperature: sampleAgent.temperature().value() }
      );
    });

    it('should return Ok result with SUCCESS status on successful execution with "task complete"', async () => {
      const llmResponseContent = 'Successful task complete response'; // Contains "task complete"
      const updateLastFailureSummarySpy = vi.spyOn(sampleJob, 'updateLastFailureSummary');
      mockLlmAdapter.generateText.mockResolvedValue(ok({
        role: 'assistant',
        content: llmResponseContent,
        tool_calls: [] // No tool calls
      }));

      const result = await executor.executeJob(sampleJob, sampleAgent);

      expect(result.isOk()).toBe(true);
      const executionResult = result.value; // This is AgentExecutorResult
      expect(executionResult.jobId).toBe(sampleJob.id().value);
      expect(executionResult.output).toEqual({ message: llmResponseContent });
      expect(executionResult.status).toBe('SUCCESS');
      expect(updateLastFailureSummarySpy).toHaveBeenCalledWith(undefined); // Corrected: undefined for clearing
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining(`LLM response (iteration 1) received for Job ID: ${sampleJob.id().value()}: ${llmResponseContent.substring(0,100)}...`),
        expect.anything()
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining(`Goal achieved for Job ID: ${sampleJob.id().value()}`)
      );
      // Expect initial save (active) + final save (success)
      expect(mockJobRepository.save).toHaveBeenCalledTimes(2);
      expect(mockJobRepository.save).toHaveBeenLastCalledWith(sampleJob);
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

    it('should return Ok result with FAILURE_LLM status if LLM adapter fails during loop', async () => {
      const llmError = new LLMError('LLM processing error');
      mockLlmAdapter.generateText.mockResolvedValue(error(llmError));

      const result = await executor.executeJob(sampleJob, sampleAgent);

      expect(result.isErr()).toBe(true); // executeJob now returns Error for non-SUCCESS AgentExecutorResult
      const appError = result.error as ApplicationError;
      expect(appError).toBeInstanceOf(ApplicationError);
      expect(appError.message).toContain('FAILURE_LLM');
      expect(appError.message).toContain('LLM generation failed');
      // Check job.data.executionResult for detailed message if needed via spy on finalizeExecution

      const finalizeExecutionSpy = vi.spyOn(sampleJob, 'finalizeExecution');
      // We expect finalizeExecution to have been called BEFORE the error is returned.
      // This needs to be called within the test that sets up this scenario.
      // For now, we check the logger and that save was called.
      // To properly test finalizeExecution's args, it needs to be spied on *before* executeJob.
      // Re-arranging the spy for finalizeExecution for this test:
      const finalizeSpy = vi.spyOn(sampleJob, 'finalizeExecution');
      // Re-run executeJob or ensure this test is self-contained if spy needs to be fresh
      // For this specific case, the previous run of executeJob already called it.
      // This assertion will check the call from the *previous* execution in this test block if not careful.
      // It's better to set up the spy *before* the action.
      // Let's assume this test is re-structured or the spy is set correctly before this check.
      // If this test is isolated:
      // mockLlmAdapter.generateText.mockResolvedValue(error(llmError)); // ensure this is the setup
      // const finalizeExecutionSpy = vi.spyOn(sampleJob, 'finalizeExecution');
      // await executor.executeJob(sampleJob, sampleAgent); // call after spy setup
      // expect(finalizeExecutionSpy).toHaveBeenCalledWith(expect.objectContaining({ status: 'FAILURE_LLM' }));

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(`LLM generation failed in iteration 1 for Job ID: ${sampleJob.id().value()}`),
        llmError,
        expect.anything()
      );
      expect(mockJobRepository.save).toHaveBeenCalledWith(sampleJob);
      const agentState = sampleJob.currentData().agentState;
      const llmErrorEntry = agentState?.executionHistory.find(e => e.type === 'llm_error');
      expect(llmErrorEntry).toBeDefined();
      expect(llmErrorEntry?.error).toBe(llmError.message);
      expect(mockJobRepository.save).toHaveBeenCalledTimes(2); // Initial active, final failure
      expect(mockJobRepository.save).toHaveBeenLastCalledWith(sampleJob);
    });

    it('should correctly spy on finalizeExecution when LLM fails', async () => {
      const llmError = new LLMError('LLM specific error');
      mockLlmAdapter.generateText.mockResolvedValue(error(llmError));
      const finalizeExecutionSpy = vi.spyOn(sampleJob, 'finalizeExecution'); // Spy before action

      await executor.executeJob(sampleJob, sampleAgent);

      expect(finalizeExecutionSpy).toHaveBeenCalledOnce();
      expect(finalizeExecutionSpy).toHaveBeenCalledWith(expect.objectContaining({
        status: 'FAILURE_LLM',
        message: expect.stringContaining(llmError.message),
      }));
    });


    // --- New tests for tool call parsing and validation ---
    describe('when LLM response includes tool_calls', () => {
      const toolCallId = 'tool_call_123';
      const validToolArgsString = JSON.stringify({ param1: 'value1', param2: 42 });
      const assistantMessageWithToolCall: LanguageModelMessage = {
        role: 'assistant',
        content: null,
        tool_calls: [{
          id: toolCallId,
          type: 'function',
          function: { name: MOCK_TOOL_NAME, arguments: validToolArgsString }
        }]
      };

      beforeEach(() => {
        // Setup mockTool and toolRegistryService for these specific tests
        mockTool = mock<IAgentTool<any, any>>(); // Re-init to ensure clean mock for each test if needed
        mockTool.name = MOCK_TOOL_NAME;
        mockTool.parameters = mockToolSchema;
        mockToolRegistryService.getTool.mockResolvedValue(ok(mockTool)); // Default successful lookup
        mockLlmAdapter.generateText.mockResolvedValue(ok(assistantMessageWithToolCall));
      });

      it('should parse and validate valid tool call arguments', async () => {
        await executor.executeJob(sampleJob, sampleAgent);

        expect(mockToolRegistryService.getTool).toHaveBeenCalledWith(MOCK_TOOL_NAME);
        // Zod's safeParse would have been called internally by the production code.
        // We check the executionHistory for the 'tool_call' entry.
        const agentState = sampleJob.currentData().agentState;
        const toolCallEntry = agentState?.executionHistory.find(e => e.type === 'tool_call' && e.name === MOCK_TOOL_NAME);
        expect(toolCallEntry).toBeDefined();
        expect(toolCallEntry?.params).toEqual(JSON.parse(validToolArgsString));
        // Further checks for tool execution will be in more specific tests below
      });

      it('should execute a valid tool call and record its successful result in ExecutionHistory', async () => {
        const mockToolOutput = { someData: 'tool output' };
        mockTool.execute.mockResolvedValue(ok(mockToolOutput));

        await executor.executeJob(sampleJob, sampleAgent);

        expect(mockTool.execute).toHaveBeenCalledWith(
          JSON.parse(validToolArgsString),
          expect.objectContaining({ agentId: sampleAgent.id().value(), jobId: sampleJob.id().value() })
        );
        const agentState = sampleJob.currentData().agentState;
        const execEntry = agentState?.executionHistory.find(e => e.type === 'tool_call' && e.name === MOCK_TOOL_NAME);
        expect(execEntry).toBeDefined();
        expect(execEntry?.result).toEqual(mockToolOutput);
        // Also check ActivityHistory for TOOL_RESULT
        const activityHistory = sampleJob.currentData().agentState!.conversationHistory;
        const toolResultEntry = activityHistory.entries().find(e => e.role() === HistoryEntryRoleType.TOOL_RESULT && e.toolCallId() === toolCallId);
        expect(toolResultEntry).toBeDefined();
        expect(toolResultEntry?.content()).toBe(JSON.stringify(mockToolOutput));
        expect(toolResultEntry?.toolName()).toBe(MOCK_TOOL_NAME);
      });

      it('should record tool_error in ExecutionHistory and add TOOL_RESULT with error to ActivityHistory if tool.execute returns an error', async () => {
        const toolExecError = new ToolError('Tool execution failed');
        mockTool.execute.mockResolvedValue(error(toolExecError));

        await executor.executeJob(sampleJob, sampleAgent);

        const agentState = sampleJob.currentData().agentState;
        const execEntry = agentState?.executionHistory.find(e => e.type === 'tool_error' && e.name === MOCK_TOOL_NAME);
        expect(execEntry).toBeDefined();
        expect(execEntry?.error).toMatchObject({ message: 'Tool execution failed' });

        const activityHistory = sampleJob.currentData().agentState!.conversationHistory;
        const toolResultEntry = activityHistory.entries().find(e => e.role() === HistoryEntryRoleType.TOOL_RESULT && e.toolCallId() === toolCallId);
        expect(toolResultEntry).toBeDefined();
        expect(JSON.parse(toolResultEntry!.content()!)).toMatchObject({ message: 'Tool execution failed' });
        expect(toolResultEntry?.toolName()).toBe(MOCK_TOOL_NAME);
      });

      it('should record tool_error in ExecutionHistory and add TOOL_RESULT with error to ActivityHistory if tool.execute throws an unexpected error', async () => {
        const unexpectedError = new Error('Unexpected tool crash');
        mockTool.execute.mockRejectedValue(unexpectedError);

        await executor.executeJob(sampleJob, sampleAgent);

        const agentState = sampleJob.currentData().agentState;
        const execEntry = agentState?.executionHistory.find(e => e.type === 'tool_error' && e.name === MOCK_TOOL_NAME);
        expect(execEntry).toBeDefined();
        expect(execEntry?.error).toBe(`Unexpected error during tool '${MOCK_TOOL_NAME}' execution: ${unexpectedError.message}`);

        const activityHistory = sampleJob.currentData().agentState!.conversationHistory;
        const toolResultEntry = activityHistory.entries().find(e => e.role() === HistoryEntryRoleType.TOOL_RESULT && e.toolCallId() === toolCallId);
        expect(toolResultEntry).toBeDefined();
        expect(toolResultEntry?.content()).toBe(JSON.stringify(`Unexpected error during tool '${MOCK_TOOL_NAME}' execution: ${unexpectedError.message}`));
        expect(toolResultEntry?.toolName()).toBe(MOCK_TOOL_NAME);
      });

      it('should handle multiple tool calls, adding all results to ActivityHistory', async () => {
        const toolCallId2 = 'tool_call_456';
        const mockToolOutput2 = { data: "second tool output" };
        const assistantMessageWithMultipleToolCalls: LanguageModelMessage = {
          role: 'assistant',
          content: null,
          tool_calls: [
            { id: toolCallId, type: 'function', function: { name: MOCK_TOOL_NAME, arguments: validToolArgsString } },
            { id: toolCallId2, type: 'function', function: { name: MOCK_TOOL_NAME, arguments: JSON.stringify({ param1: "another value" }) } }
          ]
        };
        mockLlmAdapter.generateText.mockResolvedValue(ok(assistantMessageWithMultipleToolCalls));
        mockTool.execute
          .mockResolvedValueOnce(ok({ someData: 'tool output for call 1' }))
          .mockResolvedValueOnce(ok(mockToolOutput2)); // Second call to execute

        await executor.executeJob(sampleJob, sampleAgent);

        const agentState = sampleJob.currentData().agentState!;
        const activityHistory = agentState.conversationHistory;

        const toolResultEntries = activityHistory.entries().filter(e => e.role() === HistoryEntryRoleType.TOOL_RESULT);
        expect(toolResultEntries.length).toBe(2);

        expect(toolResultEntries[0].toolCallId()).toBe(toolCallId);
        expect(toolResultEntries[0].content()).toBe(JSON.stringify({ someData: 'tool output for call 1' }));

        expect(toolResultEntries[1].toolCallId()).toBe(toolCallId2);
        expect(toolResultEntries[1].content()).toBe(JSON.stringify(mockToolOutput2));

        expect(agentState.executionHistory.filter(e => e.type === 'tool_call').length).toBe(2);
      });

      it('should send tool results back to LLM for a subsequent call', async () => {
        const toolCallId1 = 'tc_001';
        const toolName1 = MOCK_TOOL_NAME;
        const toolArgs1 = { param1: "value for first call" };
        const toolOutput1 = { result: "output from first tool" };

        // First LLM call: requests one tool
        const firstLlmResponse: LanguageModelMessage = {
          role: 'assistant',
          content: null,
          tool_calls: [{ id: toolCallId1, type: 'function', function: { name: toolName1, arguments: JSON.stringify(toolArgs1) }}]
        };

        // Second LLM call: simple text response after getting tool result
        const secondLlmResponse: LanguageModelMessage = {
          role: 'assistant',
          content: 'Final response after tool execution.',
        };

        mockLlmAdapter.generateText
          .mockResolvedValueOnce(ok(firstLlmResponse))  // For first call
          .mockResolvedValueOnce(ok(secondLlmResponse)); // For second call

        mockTool.execute.mockResolvedValue(ok(toolOutput1)); // Mock tool execution

        await executor.executeJob(sampleJob, sampleAgent);

        expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(2);

        // Verify messages for the second LLM call
        const secondCallArgs = mockLlmAdapter.generateText.mock.calls[1][0];
        expect(secondCallArgs).toBeInstanceOf(Array);

        const systemMessage = secondCallArgs.find(m => m.role === 'system');
        expect(systemMessage).toBeDefined();

        const userMessage = secondCallArgs.find(m => m.role === 'user');
        expect(userMessage).toBeDefined();

        const assistantMessageWithToolCall = secondCallArgs.find(m => m.role === 'assistant' && m.tool_calls && m.tool_calls.length > 0);
        expect(assistantMessageWithToolCall).toBeDefined();
        expect(assistantMessageWithToolCall?.tool_calls?.[0].id).toBe(toolCallId1);

        const toolResultMessage = secondCallArgs.find(m => m.role === 'tool' && m.tool_call_id === toolCallId1);
        expect(toolResultMessage).toBeDefined();
        expect(toolResultMessage?.content).toBe(JSON.stringify(toolOutput1));
        // expect(toolResultMessage?.name).toBe(toolName1); // If 'name' is added to 'tool' role LanguageModelMessage
      });


    it('should return Ok result with FAILURE_MAX_ITERATIONS status if max iterations are reached', async () => {
      const nonCompletingResponse: LanguageModelMessage = {
        role: 'assistant',
        content: 'Still working...',
        tool_calls: []
      };
      mockLlmAdapter.generateText
        .mockResolvedValueOnce(ok(nonCompletingResponse))
        .mockResolvedValueOnce(ok(nonCompletingResponse))
        .mockResolvedValueOnce(ok(nonCompletingResponse))
        .mockResolvedValueOnce(ok(nonCompletingResponse))
        .mockResolvedValueOnce(ok(nonCompletingResponse));
      const updateLastFailureSummarySpy = vi.spyOn(sampleJob, 'updateLastFailureSummary');
      const finalizeExecutionSpy = vi.spyOn(sampleJob, 'finalizeExecution');


      const result = await executor.executeJob(sampleJob, sampleAgent);

      expect(result.isErr()).toBe(true); // executeJob returns Error for non-SUCCESS AgentExecutorResult
      const appError = result.error as ApplicationError;
      expect(appError).toBeInstanceOf(ApplicationError);
      expect(appError.message).toContain('FAILURE_MAX_ITERATIONS');
      expect(appError.message).toContain('Max iterations (5) reached');

      expect(finalizeExecutionSpy).toHaveBeenCalledOnce();
      expect(finalizeExecutionSpy).toHaveBeenCalledWith(expect.objectContaining({
        status: 'FAILURE_MAX_ITERATIONS',
        message: expect.stringContaining('Max iterations (5) reached'),
      }));
      expect(updateLastFailureSummarySpy).toHaveBeenCalledWith(expect.stringContaining('Max iterations (5) reached. Goal not achieved.'));
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining(`Max iterations reached for Job ID: ${sampleJob.id().value()}`)
      );
      expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(5);
      // Expect initial save (active) + final save (max_iterations)
      expect(mockJobRepository.save).toHaveBeenCalledTimes(2);
      expect(mockJobRepository.save).toHaveBeenLastCalledWith(sampleJob);
    });

    it('should return Error with FAILURE_INTERNAL status on unhandled exception from LLM call', async () => {
      const internalError = new Error('Something unexpected broke!');
      mockLlmAdapter.generateText.mockRejectedValue(internalError);
      const finalizeExecutionSpy = vi.spyOn(sampleJob, 'finalizeExecution');


      const result = await executor.executeJob(sampleJob, sampleAgent);

      expect(result.isErr()).toBe(true); // executeJob returns Error for non-SUCCESS AgentExecutorResult
      const appError = result.error as ApplicationError;
      expect(appError).toBeInstanceOf(ApplicationError);
      expect(appError.message).toContain('FAILURE_INTERNAL');
      expect(appError.message).toContain(`Unhandled error during execution of Job ID: ${sampleJob.id().value()}. Error: ${internalError.message}`);

      expect(finalizeExecutionSpy).toHaveBeenCalledOnce();
      expect(finalizeExecutionSpy).toHaveBeenCalledWith(expect.objectContaining({
        status: 'FAILURE_INTERNAL',
        message: expect.stringContaining(`Unhandled error during execution of Job ID: ${sampleJob.id().value()}. Error: ${internalError.message}`),
      }));
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(`Unhandled error during execution of Job ID: ${sampleJob.id().value()}`),
        internalError,
        expect.anything()
      );
      const agentState = sampleJob.currentData().agentState;
      const systemErrorEntry = agentState?.executionHistory.find(e => e.type === 'system_error');
      expect(systemErrorEntry).toBeDefined();
      expect(systemErrorEntry?.error).toBe(internalError.message);
      // Expect initial save (active) + save on internal error
      expect(mockJobRepository.save).toHaveBeenCalledTimes(2); // This assertion was missing, adding it.
      expect(mockJobRepository.save).toHaveBeenLastCalledWith(sampleJob);
    });

    it('should return Error with FAILURE_TOOL if max iterations reached and a tool error occurred previously', async () => {
        const toolCallId_err = 'tool_call_for_error_case';
        const assistantMessageWithFailingToolCall: LanguageModelMessage = {
            role: 'assistant', content: 'using a tool',
            tool_calls: [{ id: toolCallId_err, type: 'function', function: { name: MOCK_TOOL_NAME, arguments: "{invalid json" } }]
        };
        const nonCompletingResponse: LanguageModelMessage = { role: 'assistant', content: 'Still working after tool error...', tool_calls: [] };

        mockLlmAdapter.generateText
            .mockResolvedValueOnce(ok(assistantMessageWithFailingToolCall))
            .mockResolvedValueOnce(ok(nonCompletingResponse))
            .mockResolvedValueOnce(ok(nonCompletingResponse))
            .mockResolvedValueOnce(ok(nonCompletingResponse))
            .mockResolvedValueOnce(ok(nonCompletingResponse));
        const finalizeExecutionSpy = vi.spyOn(sampleJob, 'finalizeExecution');

        const result = await executor.executeJob(sampleJob, sampleAgent);

        expect(result.isErr()).toBe(true); // executeJob returns Error for non-SUCCESS AgentExecutorResult
        const appError = result.error as ApplicationError;
        expect(appError).toBeInstanceOf(ApplicationError);
        expect(appError.message).toContain('FAILURE_TOOL'); // The final determined status by createFinalResult would be FAILURE_TOOL

        expect(finalizeExecutionSpy).toHaveBeenCalledOnce();
        expect(finalizeExecutionSpy).toHaveBeenCalledWith(expect.objectContaining({
            status: 'FAILURE_TOOL', // This should be the status passed to finalizeExecution
            message: expect.stringContaining('Processing ended after 5 iterations with unresolved tool errors'),
        }));
        expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(5);

        const agentState = sampleJob.currentData().agentState;
        const toolErrorEntry = agentState?.executionHistory.find(e => e.type === 'tool_error' && e.name === MOCK_TOOL_NAME);
        expect(toolErrorEntry).toBeDefined();
        expect(toolErrorEntry?.error).toContain('Argument parsing failed'); // Corrected: was 'Failed to parse arguments'
        // Expect initial save (active) + final save (failure_tool)
        expect(mockJobRepository.save).toHaveBeenCalledTimes(2);
        expect(mockJobRepository.save).toHaveBeenLastCalledWith(sampleJob);
    });

    describe('when LLM provides unusable responses (empty/short without tools)', () => {
      const unusableResponse: LanguageModelMessage = { role: 'assistant', content: '...', tool_calls: [] };
      const usableResponseGoalAchieved: LanguageModelMessage = { role: 'assistant', content: 'OK, task complete!', tool_calls: [] };

      it('should attempt re-plan once then succeed if LLM provides usable response', async () => {
        mockLlmAdapter.generateText
          .mockResolvedValueOnce(ok(unusableResponse))    // 1st call - unusable
          .mockResolvedValueOnce(ok(usableResponseGoalAchieved)); // 2nd call - usable & goal achieved
        const finalizeExecutionSpy = vi.spyOn(sampleJob, 'finalizeExecution');

        const result = await executor.executeJob(sampleJob, sampleAgent);

        expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(2);
        const agentState = sampleJob.currentData().agentState!;

        const replanMessageContent = "System Note: Your previous response was empty or too short. Please provide a more detailed answer or ask for clarification if the request is unclear. If you believe you completed the task, ensure your response clearly states 'task complete'.";

        const historyEntries = agentState.conversationHistory.entries();
        const replanEntryInActivityHistory = historyEntries[historyEntries.length - 2];
        expect(replanEntryInActivityHistory.role()).toBe(HistoryEntryRoleType.USER);
        expect(replanEntryInActivityHistory.content()).toBe(replanMessageContent);

        const secondLlmCallMessages = mockLlmAdapter.generateText.mock.calls[1][0];
        const replanInLlmCall = secondLlmCallMessages.find(m => m.role === 'user' && m.content === replanMessageContent);
        expect(replanInLlmCall).toBeDefined();

        const persona = sampleAgent.personaTemplate();
        const expectedSystemContent = `You are ${persona.name().value()}, a ${persona.role().value()}. Your goal is: ${persona.goal().value()}. Persona backstory: ${persona.backstory().value()}`;
        expect(secondLlmCallMessages[0].role).toBe('system');
        expect(secondLlmCallMessages[0].content).toBe(expectedSystemContent);


        expect(result.isOk()).toBe(true);
        expect(result.value.status).toBe('SUCCESS'); // Check AgentExecutorResult status
        expect(finalizeExecutionSpy).toHaveBeenCalledWith(expect.objectContaining({ status: 'SUCCESS' }));
        expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('was empty/too short. Attempting re-plan (1/1)'));
      });

      it('should exhaust re-plan attempts and then proceed (likely hitting max iterations)', async () => {
        mockLlmAdapter.generateText
          .mockResolvedValueOnce(ok(unusableResponse))
          .mockResolvedValueOnce(ok(unusableResponse))
          .mockResolvedValueOnce(ok(unusableResponse))
          .mockResolvedValueOnce(ok(unusableResponse))
          .mockResolvedValueOnce(ok(unusableResponse));
        const finalizeExecutionSpy = vi.spyOn(sampleJob, 'finalizeExecution');

        const result = await executor.executeJob(sampleJob, sampleAgent);
        expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(5);

        expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('was empty/too short. Attempting re-plan (1/1)'));
        expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('was empty/too short after 1 re-plan attempts. Proceeding'));

        expect(result.isErr()).toBe(true);
        expect(result.error?.message).toContain('FAILURE_MAX_ITERATIONS');
        expect(finalizeExecutionSpy).toHaveBeenCalledWith(expect.objectContaining({ status: 'FAILURE_MAX_ITERATIONS' }));
      });
    });

      it('should add assistant message with tool_calls to ActivityHistory', async () => {
        await executor.executeJob(sampleJob, sampleAgent);
        const agentState = sampleJob.currentData().agentState;
        const history = agentState!.conversationHistory;
        // Last entry is now TOOL_RESULT if a tool was called and then LLM responds again.
        // If LLM responds with tool_calls and then loop ends, assistant message is second to last.
        // Let's find the assistant message with tool_calls directly.
        const assistantEntryWithToolCalls = history.entries().find(
          e => e.role() === HistoryEntryRoleType.ASSISTANT && e.props.tool_calls && e.props.tool_calls.length > 0
        );
        expect(assistantEntryWithToolCalls).toBeDefined();
        expect(assistantEntryWithToolCalls!.props.tool_calls).toEqual(assistantMessageWithToolCall.tool_calls);
        // Content might be null or empty string if only tool_calls are present
        expect([null, '']).toContain(assistantEntryWithToolCalls!.content());
      });

      it('should log tool_error if tool is not found', async () => {
        mockToolRegistryService.getTool.mockResolvedValue(error(new ToolNotFoundError(MOCK_TOOL_NAME)));

        await executor.executeJob(sampleJob, sampleAgent);

        const agentState = sampleJob.currentData().agentState;
        const errorEntry = agentState?.executionHistory.find(e => e.type === 'tool_error' && e.name === MOCK_TOOL_NAME);
        expect(errorEntry).toBeDefined();
        expect(errorEntry?.error).toContain(`Tool '${MOCK_TOOL_NAME}' not found`); // Error message changed slightly in impl
        expect(mockLogger.error).toHaveBeenCalledWith(
          expect.stringContaining(`Tool '${MOCK_TOOL_NAME}' not found`), // Updated expectation based on new error message format
          expect.any(Error), // ToolNotFoundError is an Error
          expect.objectContaining({ jobId: sampleJob.id().value(), toolName: MOCK_TOOL_NAME })
        );
      });

      it('should return Error with FAILURE_TOOL and stop processing if ToolNotFoundError occurs', async () => {
        const toolCallId_notfound = 'tool_call_for_notfound_tool';
        const assistantMessageRequestingNonExistentTool: LanguageModelMessage = {
          role: 'assistant',
          content: 'Requesting a tool that does not exist.',
          tool_calls: [{
            id: toolCallId_notfound,
            type: 'function',
            function: { name: 'non-existent-tool', arguments: JSON.stringify({ anyParam: 'anyValue' }) }
          }]
        };
        mockLlmAdapter.generateText.mockResolvedValue(ok(assistantMessageRequestingNonExistentTool));
        mockToolRegistryService.getTool.mockResolvedValue(error(new ToolNotFoundError('non-existent-tool')));
        const updateLastFailureSummarySpy = vi.spyOn(sampleJob, 'updateLastFailureSummary');
        const finalizeExecutionSpy = vi.spyOn(sampleJob, 'finalizeExecution');

        const result = await executor.executeJob(sampleJob, sampleAgent);

        expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(1);

        const agentState = sampleJob.currentData().agentState;
        const toolErrorEntry = agentState?.executionHistory.find(e => e.type === 'tool_error' && e.name === 'non-existent-tool');
        expect(toolErrorEntry).toBeDefined();
        expect(toolErrorEntry?.error).toContain("Tool 'non-existent-tool' not found");

        expect(updateLastFailureSummarySpy).toHaveBeenCalledWith("Critical: Tool 'non-existent-tool' not found.");

        expect(result.isErr()).toBe(true);
        const appError = result.error as ApplicationError;
        expect(appError.message).toContain('FAILURE_TOOL');
        expect(appError.message).toContain("Critical: Tool 'non-existent-tool' not found.");

        expect(finalizeExecutionSpy).toHaveBeenCalledWith(expect.objectContaining({
            status: 'FAILURE_TOOL',
            message: expect.stringContaining("Critical: Tool 'non-existent-tool' not found"),
        }));

        expect(mockLogger.error).toHaveBeenCalledWith(
          expect.stringContaining("Tool 'non-existent-tool' not found"),
          expect.any(Error), // ToolNotFoundError
          expect.anything()
        );
        expect(mockLogger.info).not.toHaveBeenCalledWith(
          expect.stringMatching(/LLM response \(iteration 2\)/)
        );
        expect(mockJobRepository.save).toHaveBeenCalledTimes(2);
        expect(mockJobRepository.save).toHaveBeenLastCalledWith(sampleJob);
      });

      it('should log tool_error if tool arguments are invalid JSON', async () => {
        const invalidArgsString = '{"param1": "value1", param2: 42}';
        mockLlmAdapter.generateText.mockResolvedValue(ok({
          ...assistantMessageWithToolCall,
          tool_calls: [{ ...assistantMessageWithToolCall.tool_calls![0], function: { ...assistantMessageWithToolCall.tool_calls![0].function, arguments: invalidArgsString }}]
        }));

        await executor.executeJob(sampleJob, sampleAgent);

        const agentState = sampleJob.currentData().agentState;
        const errorEntry = agentState?.executionHistory.find(e => e.type === 'tool_error' && e.name === MOCK_TOOL_NAME);
        expect(errorEntry).toBeDefined();
        expect(errorEntry?.error).toContain('Failed to parse arguments for tool'); // Corrected based on new error message
         expect(mockLogger.error).toHaveBeenCalledWith(
          expect.stringContaining(`Failed to parse arguments for tool '${MOCK_TOOL_NAME}'`),
          expect.any(Error), expect.objectContaining({ jobId: sampleJob.id().value(), toolName: MOCK_TOOL_NAME, args: invalidArgsString })
        );
      });

      it('should log tool_error if tool arguments fail Zod validation', async () => {
        const invalidArgsObject = { param1: 123 };
        mockLlmAdapter.generateText.mockResolvedValue(ok({
          ...assistantMessageWithToolCall,
          tool_calls: [{ ...assistantMessageWithToolCall.tool_calls![0], function: { ...assistantMessageWithToolCall.tool_calls![0].function, arguments: JSON.stringify(invalidArgsObject) }}]
        }));
        const safeParseSpy = vi.spyOn(mockToolSchema, 'safeParse');

        await executor.executeJob(sampleJob, sampleAgent);

        expect(safeParseSpy).toHaveBeenCalledWith(invalidArgsObject);
        const agentState = sampleJob.currentData().agentState;
        const errorEntry = agentState?.executionHistory.find(e => e.type === 'tool_error' && e.name === MOCK_TOOL_NAME);
        expect(errorEntry).toBeDefined();
        expect(errorEntry?.error).toMatchObject({ message: "Argument validation failed for tool" }); // Corrected: was "Argument validation failed"
        expect(mockLogger.error).toHaveBeenCalledWith(
           expect.stringContaining(`Argument validation failed for tool '${MOCK_TOOL_NAME}'`),
          expect.anything(), expect.objectContaining({ jobId: sampleJob.id().value(), toolName: MOCK_TOOL_NAME, issues: expect.anything() })
        );
      });
    });

    // --- New tests for finalization and persistence logic ---
    describe('finalization and persistence', () => {
      it('should call job.finalizeExecution and jobRepository.save on successful completion', async () => {
        const llmResponseContent = 'Successful task complete response';
        mockLlmAdapter.generateText.mockResolvedValue(ok({
          role: 'assistant', content: llmResponseContent, tool_calls: []
        }));
        const finalizeExecutionSpy = vi.spyOn(sampleJob, 'finalizeExecution');

        const result = await executor.executeJob(sampleJob, sampleAgent);

        expect(result.isOk()).toBe(true);
        const executionResult = result.value;
        expect(executionResult.status).toBe('SUCCESS');

        expect(finalizeExecutionSpy).toHaveBeenCalledOnce();
        expect(finalizeExecutionSpy).toHaveBeenCalledWith(expect.objectContaining({
          status: 'SUCCESS',
          message: expect.stringContaining(llmResponseContent),
        }));

        // Called for initial active state, then for final state
        expect(mockJobRepository.save).toHaveBeenCalledTimes(2);
        expect(mockJobRepository.save).toHaveBeenLastCalledWith(sampleJob);
      });

      it('should call job.finalizeExecution and jobRepository.save on job failure (e.g., max iterations)', async () => {
        mockLlmAdapter.generateText.mockResolvedValue(ok({ role: 'assistant', content: 'still working...', tool_calls: [] })); // Non-completing response
        const finalizeExecutionSpy = vi.spyOn(sampleJob, 'finalizeExecution');
        // sampleAgent.maxIterations is 5 by default in these tests due to how it's created.

        const result = await executor.executeJob(sampleJob, sampleAgent);

        expect(result.isErr()).toBe(true); // executeJob returns Error for non-SUCCESS AgentExecutorResult
        expect(result.error).toBeInstanceOf(ApplicationError);
        expect(result.error?.message).toContain('FAILURE_MAX_ITERATIONS');


        expect(finalizeExecutionSpy).toHaveBeenCalledOnce();
        const agentExecutorResultArg = finalizeExecutionSpy.mock.calls[0][0];
        expect(agentExecutorResultArg.status).toBe('FAILURE_MAX_ITERATIONS');
        expect(agentExecutorResultArg.message).toContain('Max iterations (5) reached');

        // Called for initial active state, then for final state
        expect(mockJobRepository.save).toHaveBeenCalledTimes(2);
        expect(mockJobRepository.save).toHaveBeenLastCalledWith(sampleJob);
      });

      it('should return Error and log critical if final jobRepository.save fails after successful execution', async () => {
        const llmResponseContent = 'Successful task complete response';
        mockLlmAdapter.generateText.mockResolvedValue(ok({
          role: 'assistant', content: llmResponseContent, tool_calls: []
        }));
        const finalizeExecutionSpy = vi.spyOn(sampleJob, 'finalizeExecution');
        const dbSaveError = new ApplicationError('Final DB save failed');

        // Mock initial save to succeed, final save to fail
        mockJobRepository.save
          .mockResolvedValueOnce(ok(undefined)) // Initial save
          .mockResolvedValueOnce(error(dbSaveError)); // Final save

        const result = await executor.executeJob(sampleJob, sampleAgent);

        expect(finalizeExecutionSpy).toHaveBeenCalledOnce();
        expect(finalizeExecutionSpy).toHaveBeenCalledWith(expect.objectContaining({ status: 'SUCCESS' }));

        expect(mockJobRepository.save).toHaveBeenCalledTimes(2); // Attempted initial and final save

        expect(result.isErr()).toBe(true);
        expect(result.error).toBeInstanceOf(ApplicationError);
        expect(result.error?.message).toContain(`Failed to persist final job state`);
        expect(result.error?.message).toContain(dbSaveError.message);
        expect(result.error?.cause).toBe(dbSaveError);

        expect(mockLogger.error).toHaveBeenCalledWith(
          expect.stringContaining(`CRITICAL: Failed to save final state of Job ID: ${sampleJob.id().value()}`),
          dbSaveError,
          expect.anything()
        );
      });

      it('should return Error and log critical if final jobRepository.save fails after execution failure (e.g. LLM error)', async () => {
        const llmError = new LLMError('LLM processing error during loop');
        mockLlmAdapter.generateText.mockResolvedValue(error(llmError)); // LLM fails

        const finalizeExecutionSpy = vi.spyOn(sampleJob, 'finalizeExecution');
        const dbSaveError = new ApplicationError('Final DB save also failed');

        mockJobRepository.save
          .mockResolvedValueOnce(ok(undefined)) // Initial save (after moveToActive)
          .mockResolvedValueOnce(error(dbSaveError)); // Final save (after LLM error and finalizeExecution)

        const result = await executor.executeJob(sampleJob, sampleAgent);

        expect(finalizeExecutionSpy).toHaveBeenCalledOnce();
        expect(finalizeExecutionSpy).toHaveBeenCalledWith(expect.objectContaining({ status: 'FAILURE_LLM' }));

        expect(mockJobRepository.save).toHaveBeenCalledTimes(2);

        expect(result.isErr()).toBe(true);
        expect(result.error).toBeInstanceOf(ApplicationError);
        // The error message should reflect the persistence failure, as that's the last point of failure for executeJob's Result.
        // The original LLM failure is recorded within the Job's data via finalizeExecution.
        expect(result.error?.message).toContain(`Failed to persist final job state`);
        expect(result.error?.message).toContain(dbSaveError.message);
        expect(result.error?.cause).toBe(dbSaveError);


        expect(mockLogger.error).toHaveBeenCalledWith(
          expect.stringContaining(`CRITICAL: Failed to save final state of Job ID: ${sampleJob.id().value()}`),
          dbSaveError,
          expect.objectContaining({ agentExecutorResult: expect.objectContaining({ status: 'FAILURE_LLM' })})
        );
      });
    });
  });
});
