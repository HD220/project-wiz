// Vitest
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { mock, DeepMockProxy } from 'vitest-mock-extended';
import { z } from 'zod';

// Core Service
import { GenericAgentExecutor } from './generic-agent-executor.service';

// Domain Entities & VOs
import { Agent } from '@/domain/agent/agent.entity';
import { IAgentInternalStateRepository } from '@/domain/agent/ports/i-agent-internal-state.repository';
import { AgentId } from '@/domain/agent/value-objects/agent-id.vo';
import { AgentPersonaTemplate } from '@/domain/agent/value-objects/agent-persona-template.vo';
import { MaxIterations } from '@/domain/agent/value-objects/max-iterations.vo';
import { PersonaBackstory } from '@/domain/agent/value-objects/persona/persona-backstory.vo';
import { PersonaGoal } from '@/domain/agent/value-objects/persona/persona-goal.vo';
import { PersonaId } from '@/domain/agent/value-objects/persona/persona-id.vo';
import { PersonaName } from '@/domain/agent/value-objects/persona/persona-name.vo';
import { PersonaRole } from '@/domain/agent/value-objects/persona/persona-role.vo';
import { ToolNames } from '@/domain/agent/value-objects/persona/tool-names.vo';
import { AgentTemperature } from '@/domain/agent/value-objects/agent-temperature.vo';
import { ApplicationError } from '@/application/common/errors';
import { ILLMAdapter, LanguageModelMessage } from '@/application/ports/adapters/i-llm.adapter';
import { IToolRegistryService } from '@/application/ports/services/i-tool-registry.service';
import { ILogger } from '@/core/common/services/i-logger.service';
import { ToolError } from '@/domain/common/errors';
import { Job } from '@/domain/job/job.entity';
import { IJobRepository } from '@/domain/job/ports/i-job.repository';
import { HistoryEntryRoleType } from '@/domain/job/value-objects/activity-history-entry.vo';
// import { JobId } from '@/domain/job/value-objects/job-id.vo'; // Not directly used
import { JobName } from '@/domain/job/value-objects/job-name.vo';
import { JobStatus, JobStatusType } from '@/domain/job/value-objects/job-status.vo';
import { TargetAgentRole } from '@/domain/job/value-objects/target-agent-role.vo';
import { LLMProviderConfigId } from '@/domain/llm-provider-config/value-objects/llm-provider-config-id.vo';
import { Result, ok, error } from '@/shared/result';
import { IAgentTool } from '@/core/tools/tool.interface';


describe('GenericAgentExecutor', () => {
  // Variáveis para mocks e a instância do executor
  let mockLlmAdapter: DeepMockProxy<ILLMAdapter>;
  let mockSuccessfulTool: DeepMockProxy<IAgentTool<any, any>>;
  let mockRecoverableErrorTool: DeepMockProxy<IAgentTool<any, any>>;
  let mockNonRecoverableErrorTool: DeepMockProxy<IAgentTool<any, any>>;
  let mockValidationTestTool: DeepMockProxy<IAgentTool<any, any>>; // Added
  let mockToolRegistryService: DeepMockProxy<IToolRegistryService>;
  let mockJobRepository: DeepMockProxy<IJobRepository>;
  let mockAgentInternalStateRepository: DeepMockProxy<IAgentInternalStateRepository>;
  let mockLogger: DeepMockProxy<ILogger>;
  let executor: GenericAgentExecutor;

  // Variáveis para instâncias mock/reais de Job e Agent
  let mockJob: Job;
  let mockAgent: Agent;
  let mockPersonaTemplate: AgentPersonaTemplate;
  // let mockLlmProviderConfig: LLMProviderConfig; // Not needed as per conceptual plan


  beforeEach(() => {
    mockLlmAdapter = mock<ILLMAdapter>();
    mockToolRegistryService = mock<IToolRegistryService>();

    // Define Mock Tool
    mockSuccessfulTool = mock<IAgentTool<any, any>>();
    mockSuccessfulTool.name = 'mockSuccessTool';
    mockSuccessfulTool.description = 'A mock tool that always succeeds.';
    mockSuccessfulTool.parameters = z.object({ param1: z.string().optional() });
    // It's important to mock the specific method instance if it's to be checked by `toHaveBeenCalledWith`
    // or if its return value is critical per test. For a general mock setup:
    mockSuccessfulTool.execute.mockResolvedValue(ok({ toolOutput: "value from successful tool" }));

    // Define Mock Recoverable Error Tool
    mockRecoverableErrorTool = mock<IAgentTool<any, any>>();
    mockRecoverableErrorTool.name = 'recoverableErrorTool';
    mockRecoverableErrorTool.description = 'A mock tool that returns a recoverable error.';
    mockRecoverableErrorTool.parameters = z.object({ data: z.string() });
    const recoverableError = new ToolError(
        "Simulated recoverable error from tool",
        "recoverableErrorTool", // toolName
        new Error("Original error detail for recoverable"), // originalError
        true // isRecoverable = true
    );
    mockRecoverableErrorTool.execute.mockResolvedValue(error(recoverableError));

    // Define Mock Non-Recoverable Error Tool
    mockNonRecoverableErrorTool = mock<IAgentTool<any, any>>();
    mockNonRecoverableErrorTool.name = 'nonRecoverableErrorTool';
    mockNonRecoverableErrorTool.description = 'A mock tool that returns a non-recoverable error.';
    mockNonRecoverableErrorTool.parameters = z.object({ criticalParam: z.string() });
    const nonRecoverableError = new ToolError(
        "Simulated CRITICAL non-recoverable error",
        "nonRecoverableErrorTool", // toolName
        new Error("Underlying cause of critical failure"), // originalError
        false // isRecoverable = false
    );
    mockNonRecoverableErrorTool.execute.mockResolvedValue(error(nonRecoverableError));

    // Define Mock Validation Test Tool
    mockValidationTestTool = mock<IAgentTool<any, any>>();
    mockValidationTestTool.name = 'validationTestTool';
    mockValidationTestTool.description = 'A mock tool with specific argument validation.';
    mockValidationTestTool.parameters = z.object({ requiredParam: z.string().min(3) });
    mockValidationTestTool.execute.mockResolvedValue(ok({ output: "should not be called if validation fails" }));

    mockJobRepository = mock<IJobRepository>();
    mockAgentInternalStateRepository = mock<IAgentInternalStateRepository>();
    mockLogger = mock<ILogger>();

    // Configurar retornos padrão para o logger para evitar erros de undefined
    mockLogger.info.mockReturnValue();
    mockLogger.warn.mockReturnValue();
    mockLogger.error.mockReturnValue();
    mockLogger.debug.mockReturnValue();

    executor = new GenericAgentExecutor(
      mockLlmAdapter,
      mockToolRegistryService,
      mockJobRepository,
      mockAgentInternalStateRepository,
      mockLogger
    );

    mockPersonaTemplate = AgentPersonaTemplate.create({
        id: PersonaId.generate(),
        name: PersonaName.create('Test Persona').unwrap(),
        role: PersonaRole.create('Conceptual Tester').unwrap(),
        goal: PersonaGoal.create('To test conceptually').unwrap(),
        backstory: PersonaBackstory.create('Created for testing').unwrap(),
        toolNames: ToolNames.create([]).unwrap(),
    }).unwrap();

    mockAgent = Agent.create({
        id: AgentId.generate(),
        personaTemplate: mockPersonaTemplate,
        llmProviderConfigId: LLMProviderConfigId.generate(), // Corrected: Use LLMProviderConfigId
        temperature: AgentTemperature.create(0.5).unwrap(),
        maxIterations: MaxIterations.create(5).unwrap(),
    }).unwrap();

    mockJob = Job.create({
      name: JobName.create('Initial Test Job').unwrap(),
      payload: { initialPrompt: 'Test the executor setup.' },
      targetAgentRole: TargetAgentRole.create('TestAgent').unwrap(), // Corrected: Use TargetAgentRole
    }).unwrap(); // Added unwrap for Job.create

    mockJobRepository.save.mockResolvedValue(ok(mockJob));
    // Simular que moveToActive funciona e é permitido
    vi.spyOn(mockJob, 'moveToActive').mockReturnValue(true);
    // Simular que o status inicial permite a transição para active
    // Ensure JobStatus.pending() is the correct static method or constructor for a pending status.
    // If JobStatus is an enum, use JobStatusType.PENDING or similar.
    // Based on the conceptual plan, JobStatus.pending() is assumed to be a static factory.
    vi.spyOn(mockJob, 'status', 'get').mockReturnValue(JobStatus.pending());
  });

  it('should be created successfully with mocked dependencies', () => {
    expect(executor).toBeInstanceOf(GenericAgentExecutor);
  });

  it('should successfully execute a simple job without tool_calls when LLM indicates goal achieved', async () => {
    // Arrange
    // mockJob and mockAgent are from beforeEach.
    // The payload for mockJob in beforeEach is { initialPrompt: 'Test the executor setup.' }
    // This implies the conversationHistory will have one user entry.

    const llmResponseContent = 'Goal achieved. Task is complete.';
    mockLlmAdapter.generateText.mockResolvedValueOnce(
      ok({
        role: 'assistant',
        content: llmResponseContent,
        tool_calls: [],
      }),
    );

    // Spies
    const updateAgentStateSpy = vi.spyOn(mockJob, 'updateAgentState').mockReturnThis();
    const finalizeExecutionSpy = vi.spyOn(mockJob, 'finalizeExecution');


    // Act
    const result = await executor.executeJob(mockJob, mockAgent);

    // Assert
    // General Result
    expect(result.isOk()).toBe(true);
    const executionResult = result.unwrap();
    expect(executionResult.status).toBe('SUCCESS');
    // Message might vary slightly based on GenericAgentExecutor's exact implementation detail for success message
    expect(executionResult.message).toContain(llmResponseContent);
    expect(executionResult.output).toEqual({ message: llmResponseContent });

    // LLM Interaction
    expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(1);
    // Optional: Verify arguments to generateText
    const generateTextArgs = mockLlmAdapter.generateText.mock.calls[0];
    const messagesArg = generateTextArgs[0];
    expect(messagesArg).toEqual(expect.arrayContaining([
      expect.objectContaining({ role: 'system' }), // System prompt from persona
      expect.objectContaining({ role: 'user', content: 'Test the executor setup.' }) // Initial prompt
    ]));
    expect(generateTextArgs[1]).toEqual({ temperature: 0.5 });


    // Job State
    expect(mockJob.status().is(JobStatusType.COMPLETED)).toBe(true);
    expect(finalizeExecutionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'SUCCESS',
        message: llmResponseContent,
      }),
    );

    // ActivityHistory
    // Assuming HistoryEntryRoleType is available or will be imported.
    // For now, using string roles for simplicity if import is missing.
    // Will be corrected in 'Import Necessary Types' step if needed.
    const agentState = mockJob.currentData().agentState;
    const history = agentState.conversationHistory.entries();

    expect(history.length).toBe(2); // Initial user prompt + assistant response
    expect(history[0].role()).toBe(HistoryEntryRoleType.USER);
    expect(history[0].content()).toBe('Test the executor setup.');
    expect(history[1].role()).toBe(HistoryEntryRoleType.ASSISTANT);
    expect(history[1].content()).toBe(llmResponseContent);
    expect(history[1].props.tool_calls).toBeUndefined();


    // ExecutionHistory
    expect(agentState.executionHistory).toEqual([]);

    // JobRepository Saves
    expect(mockJobRepository.save).toHaveBeenCalledTimes(2); // Once for ACTIVE, once for COMPLETED
    expect(vi.mocked(mockJobRepository.save).mock.calls[0][0].status().is(JobStatusType.ACTIVE)).toBe(true);
    expect(vi.mocked(mockJobRepository.save).mock.calls[1][0].status().is(JobStatusType.COMPLETED)).toBe(true);

    // Logger Calls
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`Executing Job ID: ${mockJob.id().value}`), expect.anything());
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`Calling LLM for Job ID: ${mockJob.id().value}`), expect.anything());
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`LLM response (iteration 1) received for Job ID: ${mockJob.id().value()}`), expect.anything());
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`Goal achieved for Job ID: ${mockJob.id().value()}`), expect.anything());
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`Job ID: ${mockJob.id().value()} finalized with status: SUCCESS and persisted successfully`), expect.anything());
  });

  it('should finish with FAILURE_MAX_ITERATIONS when maxIterations is reached', async () => {
    // Arrange
    const maxIter = 3;
    const lowIterationAgent = Agent.create({
        id: AgentId.generate(),
        personaTemplate: mockAgent.personaTemplate(),
        llmProviderConfigId: mockAgent.llmProviderConfigId(),
        temperature: AgentTemperature.create(0.7).unwrap(),
        maxIterations: MaxIterations.create(maxIter).unwrap()
    }).unwrap();

    // Mock LLM to always return a non-conclusive response
    mockLlmAdapter.generateText.mockResolvedValue(
      ok({
        role: 'assistant',
        content: 'Still thinking...',
        tool_calls: [],
      }),
    );

    // Reset save mock calls for this specific test if needed, though new job instance might be cleaner
    // For this test, we'll use the global mockJob but check its state after lowIterationAgent runs.
    // It's important that mockJobRepository.save continues to work as in beforeEach.
    // Spies
    const updateAgentStateSpy = vi.spyOn(mockJob, 'updateAgentState').mockReturnThis(); // Already spied in previous test, ensure it's fresh or re-spy
    const finalizeExecutionSpy = vi.spyOn(mockJob, 'finalizeExecution');
    const updateLastFailureSummarySpy = vi.spyOn(mockJob, 'updateLastFailureSummary');

    // Act
    const result = await executor.executeJob(mockJob, lowIterationAgent);

    // Assert
    // General Result
    expect(result.isOk()).toBe(true); // Executor itself completes and reports the failure status
    const executionResult = result.unwrap();
    expect(executionResult.status).toBe('FAILURE_MAX_ITERATIONS');
    expect(executionResult.message).toContain(`Max iterations (${maxIter}) reached. Goal not achieved.`);
    expect(executionResult.output).toEqual({ message: `Max iterations (${maxIter}) reached. Goal not achieved. Last LLM response: Still thinking...` });


    // LLM Interaction
    expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(maxIter);

    // Job State
    expect(mockJob.status().is(JobStatusType.FAILED)).toBe(true);
    expect(updateLastFailureSummarySpy).toHaveBeenCalledWith(expect.stringContaining(`Max iterations (${maxIter}) reached. Goal not achieved.`));
    expect(finalizeExecutionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'FAILURE_MAX_ITERATIONS',
        message: expect.stringContaining(`Max iterations (${maxIter}) reached`),
      }),
    );

    // ActivityHistory
    const agentState = mockJob.currentData().agentState;
    const history = agentState.conversationHistory.entries();
    // Expected: 1 initial user prompt + maxIter assistant responses
    expect(history.length).toBe(1 + maxIter);
    expect(history[0].role()).toBe(HistoryEntryRoleType.USER);
    for (let i = 0; i < maxIter; i++) {
      expect(history[i + 1].role()).toBe(HistoryEntryRoleType.ASSISTANT);
      expect(history[i + 1].content()).toBe('Still thinking...');
    }

    // JobRepository Saves
    // At least 2 (ACTIVE, FAILED). Potentially more if agentState is saved per iteration.
    // For this test, we mainly care that the final save reflects the FAILED state.
    expect(mockJobRepository.save).toHaveBeenCalled(); // General check
    const lastSaveCall = vi.mocked(mockJobRepository.save).mock.calls.pop(); // Get the last call
    expect(lastSaveCall).toBeDefined();
    if (lastSaveCall) {
        expect(lastSaveCall[0].status().is(JobStatusType.FAILED)).toBe(true);
    }


    // Logger Calls
    expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining(`Max iterations (${maxIter}) reached for Job ID: ${mockJob.id().value()}`), expect.anything());
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`Job ID: ${mockJob.id().value()} finalized with status: FAILURE_MAX_ITERATIONS and persisted successfully`), expect.anything());
  });

  it('should finish with FAILURE_LLM when ILLMAdapter.generateText returns an error', async () => {
    // Arrange
    const simulatedError = new ApplicationError('Simulated LLM API Error'); // Using ApplicationError as per plan, will adjust if LLMError is more suitable
    mockLlmAdapter.generateText.mockResolvedValueOnce(error(simulatedError));

    // Spies
    const updateAgentStateSpy = vi.spyOn(mockJob, 'updateAgentState').mockReturnThis();
    const finalizeExecutionSpy = vi.spyOn(mockJob, 'finalizeExecution');
    const updateLastFailureSummarySpy = vi.spyOn(mockJob, 'updateLastFailureSummary');


    // Act
    const result = await executor.executeJob(mockJob, mockAgent);

    // Assert
    // General Result
    expect(result.isOk()).toBe(true); // Executor itself completes, result indicates job failure type
    const executionResult = result.unwrap();
    expect(executionResult.status).toBe('FAILURE_LLM');
    expect(executionResult.message).toContain('LLM generation failed');
    expect(executionResult.message).toContain('Simulated LLM API Error');
    // As per conceptual plan, checking if errors array contains relevant info
    // This depends on how GenericAgentExecutor packages errors into AgentExecutorResult
    // Assuming errors might be part of the message or a separate property
     expect(executionResult.output).toEqual({ message: 'LLM generation failed: Simulated LLM API Error' }); // Or similar based on actual output


    // LLM Interaction
    expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(1);

    // Job State
    expect(mockJob.status().is(JobStatusType.FAILED)).toBe(true);
    // Check if lastFailureSummary is updated (this might depend on how executor handles it)
    // expect(updateLastFailureSummarySpy).toHaveBeenCalledWith(expect.stringContaining('Simulated LLM API Error'));
    expect(finalizeExecutionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'FAILURE_LLM',
        message: expect.stringContaining('Simulated LLM API Error'),
      }),
    );

    // ExecutionHistory
    const agentState = mockJob.currentData().agentState;
    const errorEntry = agentState.executionHistory.find(e => e.type === 'llm_error');
    expect(errorEntry).toBeDefined();
    expect(errorEntry?.name).toBe('LLM Generation'); // Assuming this is the name used internally
    expect(errorEntry?.error).toContain('Simulated LLM API Error');

    // JobRepository Saves
    expect(mockJobRepository.save).toHaveBeenCalledTimes(2); // ACTIVE and FAILED
    const lastSaveCall = vi.mocked(mockJobRepository.save).mock.calls.pop();
    expect(lastSaveCall).toBeDefined();
    if(lastSaveCall) {
        expect(lastSaveCall[0].status().is(JobStatusType.FAILED)).toBe(true);
    }

    // Logger Calls
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('LLM generation failed in iteration 1 for Job ID:'), // Iteration number might vary if logic changes
      simulatedError,
      expect.anything()
    );
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`Job ID: ${mockJob.id().value()} finalized with status: FAILURE_LLM and persisted successfully`), expect.anything());
  });

  it('should successfully execute a job with a successful tool_call and continue LLM interaction to completion', async () => {
    // Arrange
    const toolCallId = 'toolCallId123';
    const toolName = 'mockSuccessTool';
    const toolArgsString = '{"param1": "test"}';
    const toolArgsObject = { param1: 'test' };
    const toolOutput = { toolOutput: "value from successful tool" };

    mockToolRegistryService.getTool.calledWith(toolName).mockResolvedValue(ok(mockSuccessfulTool));
    // mockSuccessfulTool.execute is already mocked in beforeEach to return ok(toolOutput)

    mockLlmAdapter.generateText
      .mockResolvedValueOnce(
        ok({
          role: 'assistant',
          content: null,
          tool_calls: [{ id: toolCallId, type: 'function', function: { name: toolName, arguments: toolArgsString } }],
        }),
      )
      .mockResolvedValueOnce(
        ok({
          role: 'assistant',
          content: 'Goal achieved after using mockSuccessTool.',
          tool_calls: [],
        }),
      );

    // Spies
    const updateAgentStateSpy = vi.spyOn(mockJob, 'updateAgentState').mockReturnThis();
    const finalizeExecutionSpy = vi.spyOn(mockJob, 'finalizeExecution');

    // Act
    const result = await executor.executeJob(mockJob, mockAgent);

    // Assert
    // General Result
    expect(result.isOk()).toBe(true);
    const executionResult = result.unwrap();
    expect(executionResult.status).toBe('SUCCESS');
    expect(executionResult.message).toContain('Goal achieved after using mockSuccessTool.');
    expect(executionResult.output).toEqual({ message: 'Goal achieved after using mockSuccessTool.' });

    // LLM Interaction
    expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(2);
    const firstLlmCallArgs = mockLlmAdapter.generateText.mock.calls[0][0];
    expect(firstLlmCallArgs).toEqual(expect.arrayContaining([
        expect.objectContaining({ role: 'system' }),
        expect.objectContaining({ role: 'user', content: 'Test the executor setup.' })
    ]));
    const secondLlmCallArgs = mockLlmAdapter.generateText.mock.calls[1][0];
    expect(secondLlmCallArgs).toEqual(expect.arrayContaining([
        expect.objectContaining({ role: 'system' }),
        expect.objectContaining({ role: 'user', content: 'Test the executor setup.' }),
        expect.objectContaining({ role: 'assistant', tool_calls: expect.arrayContaining([expect.objectContaining({ id: toolCallId})]) }),
        expect.objectContaining({ role: 'tool', tool_call_id: toolCallId, content: JSON.stringify(toolOutput) })
    ]));


    // Tool Interaction
    expect(mockToolRegistryService.getTool).toHaveBeenCalledWith(toolName);
    expect(mockSuccessfulTool.execute).toHaveBeenCalledTimes(1);
    expect(mockSuccessfulTool.execute).toHaveBeenCalledWith(toolArgsObject, expect.objectContaining({ jobId: mockJob.id().value(), agentId: mockAgent.id().value() }));

    // Job State
    expect(mockJob.status().is(JobStatusType.COMPLETED)).toBe(true);
    expect(finalizeExecutionSpy).toHaveBeenCalledWith(expect.objectContaining({ status: 'SUCCESS', message: 'Goal achieved after using mockSuccessTool.' }));

    // ActivityHistory
    const agentState = mockJob.currentData().agentState;
    const history = agentState.conversationHistory.entries();
    // Expected: User Prompt -> Assistant (tool_call) -> Tool Result -> Assistant (final)
    expect(history.length).toBe(4);
    expect(history[0].role()).toBe(HistoryEntryRoleType.USER);
    expect(history[1].role()).toBe(HistoryEntryRoleType.ASSISTANT);
    expect(history[1].props.tool_calls?.[0]?.function.name).toBe(toolName);
    expect(history[2].role()).toBe(HistoryEntryRoleType.TOOL_RESULT);
    expect(history[2].toolCallId()).toBe(toolCallId);
    expect(history[2].toolName()).toBe(toolName);
    expect(history[2].content()).toBe(JSON.stringify(toolOutput));
    expect(history[3].role()).toBe(HistoryEntryRoleType.ASSISTANT);
    expect(history[3].content()).toBe('Goal achieved after using mockSuccessTool.');

    // ExecutionHistory
    const execHistory = agentState.executionHistory;
    expect(execHistory.length).toBe(1);
    const toolEntry = execHistory.find(e => e.name === toolName);
    expect(toolEntry).toBeDefined();
    expect(toolEntry?.type).toBe('tool_call');
    expect(toolEntry?.params).toEqual(toolArgsObject);
    expect(toolEntry?.result).toEqual(toolOutput);
    expect(toolEntry?.error).toBeUndefined();

    // JobRepository Saves (Initial ACTIVE, after tool_call result, final COMPLETED)
    // The exact number can vary if agentState is saved more frequently.
    // Key is that it's called, and the last call reflects COMPLETED.
    expect(mockJobRepository.save).toHaveBeenCalled();
    const lastSaveCall = vi.mocked(mockJobRepository.save).mock.calls.pop();
    expect(lastSaveCall).toBeDefined();
    if(lastSaveCall) {
      expect(lastSaveCall[0].status().is(JobStatusType.COMPLETED)).toBe(true);
    }

    // Logger Calls
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`Executing tool: ${toolName}`), expect.anything());
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`Tool ${toolName} executed successfully for Job ID: ${mockJob.id().value()}`), expect.anything());
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`Calling LLM for Job ID: ${mockJob.id().value()} (iteration 2)`), expect.anything()); // Iteration 2
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`Goal achieved for Job ID: ${mockJob.id().value()}`), expect.anything());
  });

  it('should handle a recoverable ToolError, add error to history, and call LLM again for replanning', async () => {
    // Arrange
    const toolCallId = 'toolCallId456';
    const toolName = 'recoverableErrorTool';
    const toolArgsString = '{"data": "some input"}';
    const toolArgsObject = { data: "some input" };
    const recoverableErrorInst = new ToolError(
        "Simulated recoverable error from tool",
        toolName,
        new Error("Original error detail for recoverable"),
        true // isRecoverable = true
    );
    // Ensure the mock tool in beforeEach is set to return this specific error for this test if not already.
    // The beforeEach already sets up mockRecoverableErrorTool.execute to return a specific error instance.
    // We can rely on that or override here if needed for clarity or variation.
    // For this test, we use the one from beforeEach.

    mockToolRegistryService.getTool.calledWith(toolName).mockResolvedValue(ok(mockRecoverableErrorTool));

    mockLlmAdapter.generateText
      .mockResolvedValueOnce( // First LLM call: requests the tool
        ok({
          role: 'assistant',
          content: null,
          tool_calls: [{ id: toolCallId, type: 'function', function: { name: toolName, arguments: toolArgsString } }],
        }),
      )
      .mockResolvedValueOnce( // Second LLM call: after tool error, LLM replans and succeeds
        ok({
          role: 'assistant',
          content: 'Goal achieved after LLM replanned due to recoverable tool error.',
          tool_calls: [],
        }),
      );

    // Spies
    const updateAgentStateSpy = vi.spyOn(mockJob, 'updateAgentState').mockReturnThis();
    const finalizeExecutionSpy = vi.spyOn(mockJob, 'finalizeExecution');
    const updateCriticalToolFailureInfoSpy = vi.spyOn(mockJob, 'updateCriticalToolFailureInfo');


    // Act
    const result = await executor.executeJob(mockJob, mockAgent);

    // Assert
    // General Result
    expect(result.isOk()).toBe(true);
    const executionResult = result.unwrap();
    expect(executionResult.status).toBe('SUCCESS');
    expect(executionResult.message).toContain('Goal achieved after LLM replanned');

    // LLM Interaction
    expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(2);
    const secondLlmCallArgs = mockLlmAdapter.generateText.mock.calls[1][0];
    expect(secondLlmCallArgs).toEqual(expect.arrayContaining([
        expect.objectContaining({ role: 'system' }),
        expect.objectContaining({ role: 'user' }),
        expect.objectContaining({ role: 'assistant', tool_calls: expect.arrayContaining([expect.objectContaining({ id: toolCallId})]) }),
        expect.objectContaining({ role: 'tool', tool_call_id: toolCallId, content: JSON.stringify(recoverableErrorInst.toPlainObject()) }) // Error is stringified
    ]));

    // Tool Interaction
    expect(mockToolRegistryService.getTool).toHaveBeenCalledWith(toolName);
    expect(mockRecoverableErrorTool.execute).toHaveBeenCalledTimes(1);
    expect(mockRecoverableErrorTool.execute).toHaveBeenCalledWith(toolArgsObject, expect.anything());

    // Job State
    expect(mockJob.status().is(JobStatusType.COMPLETED)).toBe(true);
    expect(updateCriticalToolFailureInfoSpy).not.toHaveBeenCalled(); // Error was recoverable

    // ActivityHistory
    const agentState = mockJob.currentData().agentState;
    const history = agentState.conversationHistory.entries();
    // Expected: User -> Assistant (tool_call) -> Tool Result (error) -> Assistant (final)
    expect(history.length).toBe(4);
    expect(history[1].role()).toBe(HistoryEntryRoleType.ASSISTANT); // Tool call request
    expect(history[2].role()).toBe(HistoryEntryRoleType.TOOL_RESULT); // Tool error result
    expect(history[2].toolCallId()).toBe(toolCallId);
    expect(history[2].toolName()).toBe(toolName);
    expect(JSON.parse(history[2].content()!)).toEqual(recoverableErrorInst.toPlainObject());
    expect(history[3].role()).toBe(HistoryEntryRoleType.ASSISTANT); // Replanned success

    // ExecutionHistory
    const execHistory = agentState.executionHistory;
    const toolErrorEntry = execHistory.find(e => e.name === toolName && e.type === 'tool_error');
    expect(toolErrorEntry).toBeDefined();
    expect(toolErrorEntry?.params).toEqual(toolArgsObject);
    expect(toolErrorEntry?.error).toEqual(recoverableErrorInst.toPlainObject()); // Check plain object representation
    expect(toolErrorEntry?.isCritical).toBe(false);

    // JobRepository Saves
    expect(mockJobRepository.save).toHaveBeenCalled();
    const lastSaveCall = vi.mocked(mockJobRepository.save).mock.calls.pop();
    if (lastSaveCall) {
        expect(lastSaveCall[0].status().is(JobStatusType.COMPLETED)).toBe(true);
    }

    // Logger Calls
    expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(`Tool ${toolName} execution failed for Job ID: ${mockJob.id().value()} but was recoverable. Error: ${recoverableErrorInst.message}`),
        recoverableErrorInst, // The actual error instance
        expect.anything()
    );
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`Calling LLM for Job ID: ${mockJob.id().value()} (iteration 2)`), expect.anything());
  });

  it('should handle a non-recoverable (critical) ToolError, populate criticalToolFailureInfo, and finish with FAILURE_TOOL', async () => {
    // Arrange
    const toolCallId = 'toolCallCrit789';
    const toolName = 'nonRecoverableErrorTool';
    const toolArgsString = '{"criticalParam": "trigger"}';
    const toolArgsObject = { criticalParam: "trigger" };
    const nonRecoverableErrorInst = new ToolError(
        "Simulated CRITICAL non-recoverable error",
        toolName,
        new Error("Underlying cause of critical failure"),
        false // isRecoverable = false
    );
    // mockNonRecoverableErrorTool.execute is already set up in beforeEach to return this error.

    mockToolRegistryService.getTool.calledWith(toolName).mockResolvedValue(ok(mockNonRecoverableErrorTool));

    mockLlmAdapter.generateText.mockResolvedValueOnce( // LLM requests the tool
      ok({
        role: 'assistant',
        content: null,
        tool_calls: [{ id: toolCallId, type: 'function', function: { name: toolName, arguments: toolArgsString } }],
      }),
    );

    // Spies
    const updateAgentStateSpy = vi.spyOn(mockJob, 'updateAgentState').mockReturnThis();
    const finalizeExecutionSpy = vi.spyOn(mockJob, 'finalizeExecution');
    const updateLastFailureSummarySpy = vi.spyOn(mockJob, 'updateLastFailureSummary');
    const updateCriticalToolFailureInfoSpy = vi.spyOn(mockJob, 'updateCriticalToolFailureInfo');

    // Act
    const result = await executor.executeJob(mockJob, mockAgent);

    // Assert
    // General Result
    expect(result.isOk()).toBe(true);
    const executionResult = result.unwrap();
    expect(executionResult.status).toBe('FAILURE_TOOL');
    expect(executionResult.message).toContain(`Critical: Tool '${toolName}' failed non-recoverably: ${nonRecoverableErrorInst.message}`);
    expect(executionResult.output).toEqual({ message: `Critical: Tool '${toolName}' failed non-recoverably: ${nonRecoverableErrorInst.message}` });


    // LLM Interaction
    expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(1); // Should not call LLM again

    // Tool Interaction
    expect(mockToolRegistryService.getTool).toHaveBeenCalledWith(toolName);
    expect(mockNonRecoverableErrorTool.execute).toHaveBeenCalledTimes(1);
    expect(mockNonRecoverableErrorTool.execute).toHaveBeenCalledWith(toolArgsObject, expect.anything());

    // Job State
    expect(mockJob.status().is(JobStatusType.FAILED)).toBe(true);

    expect(updateCriticalToolFailureInfoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
            toolName: toolName,
            errorType: 'ToolError',
            message: nonRecoverableErrorInst.message,
            isRecoverable: false,
            details: expect.objectContaining({ message: "Underlying cause of critical failure" })
        })
    );
    expect(updateLastFailureSummarySpy).toHaveBeenCalledWith(
      expect.stringContaining(`Critical: Tool '${toolName}' failed non-recoverably: ${nonRecoverableErrorInst.message}`)
    );
    expect(finalizeExecutionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'FAILURE_TOOL',
        message: expect.stringContaining(`Critical: Tool '${toolName}' failed non-recoverably: ${nonRecoverableErrorInst.message}`),
      }),
    );

    // ActivityHistory - As per conceptual plan, TOOL_RESULT for critical error might not be added to conversation history.
    // Let's check the state to be sure. The current impl might add it before realizing it's critical.
    // This depends on the exact sequence in GenericAgentExecutor.
    // For now, let's assume it contains the initial user prompt and the assistant's tool call.
    const agentState = mockJob.currentData().agentState;
    const activityHistory = agentState.conversationHistory.entries();
    // If TOOL_RESULT for critical error is NOT added to conversation history:
    expect(activityHistory.length).toBe(2); // User prompt + Assistant tool call
    expect(activityHistory[0].role()).toBe(HistoryEntryRoleType.USER);
    expect(activityHistory[1].role()).toBe(HistoryEntryRoleType.ASSISTANT);
    expect(activityHistory[1].props.tool_calls?.[0].function.name).toBe(toolName);


    // ExecutionHistory
    const execHistory = agentState.executionHistory;
    const toolErrorEntry = execHistory.find(e => e.name === toolName && e.type === 'tool_error');
    expect(toolErrorEntry).toBeDefined();
    expect(toolErrorEntry?.params).toEqual(toolArgsObject);
    expect(toolErrorEntry?.error).toEqual(nonRecoverableErrorInst.toPlainObject());
    expect(toolErrorEntry?.isCritical).toBe(true);

    // JobRepository Saves
    expect(mockJobRepository.save).toHaveBeenCalledTimes(2); // ACTIVE and FAILED
    const lastSaveCall = vi.mocked(mockJobRepository.save).mock.calls.pop();
    expect(lastSaveCall).toBeDefined();
    if(lastSaveCall) {
        expect(lastSaveCall[0].status().is(JobStatusType.FAILED)).toBe(true);
    }

    // Logger Calls
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining(`Tool ${toolName} execution failed critically for Job ID: ${mockJob.id().value()}. Error: ${nonRecoverableErrorInst.message}`),
      nonRecoverableErrorInst,
      expect.anything()
    );
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`Job ID: ${mockJob.id().value()} finalized with status: FAILURE_TOOL and persisted successfully`), expect.anything());
  });

  it('should handle "Tool not found" error, populate criticalToolFailureInfo, and finish with FAILURE_TOOL', async () => {
    // Arrange
    const nonExistentToolName = 'nonExistentTool';
    const toolCallId = 'toolCallNotFound789';
    // The conceptual plan says DomainError, but the executor likely converts this to a ToolError internally.
    // Let's mock getTool to return an error that the executor will then handle.
    // The ToolNotFoundError (if used by ToolRegistryService) would be appropriate.
    // For simplicity, if ToolRegistryService returns a generic error, GenericAgentExecutor should still create a critical ToolError.
    // We'll assume the executor internally creates a ToolError with isRecoverable: false.
    mockToolRegistryService.getTool.calledWith(nonExistentToolName).mockResolvedValue(error(new ApplicationError(`Tool '${nonExistentToolName}' not found in registry.`))); // Or a more specific error like ToolNotFoundError

    mockLlmAdapter.generateText.mockResolvedValueOnce(
      ok({
        role: 'assistant',
        content: null,
        tool_calls: [{ id: toolCallId, type: 'function', function: { name: nonExistentToolName, arguments: '{}' } }],
      }),
    );

    const finalizeExecutionSpy = vi.spyOn(mockJob, 'finalizeExecution');
    const updateLastFailureSummarySpy = vi.spyOn(mockJob, 'updateLastFailureSummary');
    const updateCriticalToolFailureInfoSpy = vi.spyOn(mockJob, 'updateCriticalToolFailureInfo');

    // Act
    const result = await executor.executeJob(mockJob, mockAgent);

    // Assert
    expect(result.isOk()).toBe(true);
    const executionResult = result.unwrap();
    expect(executionResult.status).toBe('FAILURE_TOOL');
    // The exact message depends on how GenericAgentExecutor formats it.
    expect(executionResult.message).toContain(`Critical: Tool '${nonExistentToolName}' failed non-recoverably: Tool '${nonExistentToolName}' not found`);

    expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(1);
    expect(mockToolRegistryService.getTool).toHaveBeenCalledWith(nonExistentToolName);

    expect(mockJob.status().is(JobStatusType.FAILED)).toBe(true);

    expect(updateCriticalToolFailureInfoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
            toolName: nonExistentToolName,
            errorType: 'ToolError', // Executor should create a ToolError for this case
            message: expect.stringContaining(`Tool '${nonExistentToolName}' not found`),
            isRecoverable: false,
        })
    );
    expect(updateLastFailureSummarySpy).toHaveBeenCalledWith(
      expect.stringContaining(`Critical: Tool '${nonExistentToolName}' failed non-recoverably: Tool '${nonExistentToolName}' not found`)
    );
    expect(finalizeExecutionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'FAILURE_TOOL',
        message: expect.stringContaining(`Tool '${nonExistentToolName}' not found`),
      }),
    );

    const agentState = mockJob.currentData().agentState;
    const activityHistory = agentState.conversationHistory.entries();
    expect(activityHistory.length).toBe(2); // User prompt + Assistant tool call

    const execHistory = agentState.executionHistory;
    const toolErrorEntry = execHistory.find(e => e.name === nonExistentToolName && e.type === 'tool_error');
    expect(toolErrorEntry).toBeDefined();
    expect(toolErrorEntry?.isCritical).toBe(true);
    // @ts-ignore
    expect(toolErrorEntry?.error?.message).toContain(`Tool '${nonExistentToolName}' not found`);
    // @ts-ignore
    expect(toolErrorEntry?.error?.isRecoverable).toBe(false);


    expect(mockJobRepository.save).toHaveBeenCalledTimes(2); // ACTIVE and FAILED
    const lastSaveCall = vi.mocked(mockJobRepository.save).mock.calls.pop();
    if(lastSaveCall) {
        expect(lastSaveCall[0].status().is(JobStatusType.FAILED)).toBe(true);
    }

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining(`Tool ${nonExistentToolName} execution failed critically for Job ID: ${mockJob.id().value()}. Error: Tool '${nonExistentToolName}' not found`),
      expect.any(ToolError), // Executor should wrap this as a ToolError
      expect.anything()
    );
  });

  it('should handle tool argument validation failure, add error to history, and call LLM again', async () => {
    // Arrange
    const toolCallId = 'toolCallValFail1';
    const toolName = 'validationTestTool';
    const invalidToolArgsString = '{"requiredParam": "a"}'; // "a" is < min(3)
    const invalidToolArgsObject = { requiredParam: "a" };

    mockToolRegistryService.getTool.calledWith(toolName).mockResolvedValue(ok(mockValidationTestTool));
    // mockValidationTestTool.execute should not be called.

    mockLlmAdapter.generateText
      .mockResolvedValueOnce( // First LLM call: requests the tool with invalid args
        ok({
          role: 'assistant',
          content: null,
          tool_calls: [{ id: toolCallId, type: 'function', function: { name: toolName, arguments: invalidToolArgsString } }],
        }),
      )
      .mockResolvedValueOnce( // Second LLM call: after validation error, LLM "corrects" and job succeeds
        ok({
          role: 'assistant',
          content: 'Goal achieved after LLM corrected tool arguments.',
          tool_calls: [],
        }),
      );

    // Spies
    const updateAgentStateSpy = vi.spyOn(mockJob, 'updateAgentState').mockReturnThis();
    const finalizeExecutionSpy = vi.spyOn(mockJob, 'finalizeExecution');
    const updateCriticalToolFailureInfoSpy = vi.spyOn(mockJob, 'updateCriticalToolFailureInfo');

    // Act
    const result = await executor.executeJob(mockJob, mockAgent);

    // Assert
    // General Result
    expect(result.isOk()).toBe(true);
    const executionResult = result.unwrap();
    expect(executionResult.status).toBe('SUCCESS'); // Assuming LLM corrects and succeeds
    expect(executionResult.message).toContain('Goal achieved after LLM corrected tool arguments.');

    // LLM Interaction
    expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(2);
    const secondLlmCallArgs = mockLlmAdapter.generateText.mock.calls[1][0];
    // The second call to LLM should contain the validation error information
    const toolResultErrorMessage = secondLlmCallArgs.find(m => m.role === 'tool' && m.tool_call_id === toolCallId);
    expect(toolResultErrorMessage).toBeDefined();
    expect(toolResultErrorMessage?.content).toContain('Argument validation failed');
    expect(toolResultErrorMessage?.content).toContain('String must contain at least 3 character(s)');


    // Tool Interaction
    expect(mockToolRegistryService.getTool).toHaveBeenCalledWith(toolName);
    expect(mockValidationTestTool.execute).not.toHaveBeenCalled(); // Crucial: execute not called

    // Job State
    expect(mockJob.status().is(JobStatusType.COMPLETED)).toBe(true);
    expect(updateCriticalToolFailureInfoSpy).not.toHaveBeenCalled(); // Validation error is recoverable

    // ActivityHistory
    const agentState = mockJob.currentData().agentState;
    const history = agentState.conversationHistory.entries();
    // Expected: User -> Assistant (tool_call) -> Tool Result (validation error) -> Assistant (final)
    expect(history.length).toBe(4);
    expect(history[1].role()).toBe(HistoryEntryRoleType.ASSISTANT); // Tool call request
    expect(history[2].role()).toBe(HistoryEntryRoleType.TOOL_RESULT); // Validation error result
    expect(history[2].toolCallId()).toBe(toolCallId);
    expect(history[2].toolName()).toBe(toolName);
    expect(history[2].content()).toContain("Argument validation failed for tool 'validationTestTool'. Issues: [{\"code\":\"too_small\",\"minimum\":3,\"type\":\"string\",\"inclusive\":true,\"exact\":false,\"message\":\"String must contain at least 3 character(s)\",\"path\":[\"requiredParam\"]}]");
    expect(history[3].role()).toBe(HistoryEntryRoleType.ASSISTANT); // Replanned success

    // ExecutionHistory
    const execHistory = agentState.executionHistory;
    const toolErrorEntry = execHistory.find(e => e.name === toolName && e.type === 'tool_error');
    expect(toolErrorEntry).toBeDefined();
    expect(toolErrorEntry?.params).toEqual(invalidToolArgsObject); // Original invalid params
    // @ts-ignore
    expect(toolErrorEntry?.error?.message).toContain("Argument validation failed");
    // @ts-ignore
    expect(toolErrorEntry?.error?.isRecoverable).toBe(true);
    expect(toolErrorEntry?.isCritical).toBe(false);

    // JobRepository Saves
    expect(mockJobRepository.save).toHaveBeenCalled();
    const lastSaveCall = vi.mocked(mockJobRepository.save).mock.calls.pop();
    if (lastSaveCall) {
        expect(lastSaveCall[0].status().is(JobStatusType.COMPLETED)).toBe(true);
    }

    // Logger Calls
    expect(mockLogger.warn).toHaveBeenCalledWith( // Or info, depending on severity chosen for validation errors
      expect.stringContaining(`Argument validation failed for tool '${toolName}'`),
      expect.any(ToolError), // The ToolError created due to validation failure
      expect.anything()
    );
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`Calling LLM for Job ID: ${mockJob.id().value()} (iteration 2)`), expect.anything());
  });

  describe('Replan Logic for Unusable LLM Responses', () => {
    // Constants from GenericAgentExecutor (assuming they are private/not easily mockable, so using values)
    const MIN_USABLE_LLM_RESPONSE_LENGTH = 10;
    const MAX_REPLAN_ATTEMPTS_FOR_EMPTY_RESPONSE = 1;

    it('should replan and succeed if initial LLM response is too short (less than MIN_USABLE_LLM_RESPONSE_LENGTH)', async () => {
      // Arrange
      const shortResponseContent = "Eh?"; // Length is 3, less than 10
      const successResponseContent = "Goal achieved after replan with a longer, useful response.";

      mockLlmAdapter.generateText
        .mockResolvedValueOnce(ok({ role: 'assistant', content: shortResponseContent, tool_calls: [] }))
        .mockResolvedValueOnce(ok({ role: 'assistant', content: successResponseContent, tool_calls: [] }));

      const finalizeExecutionSpy = vi.spyOn(mockJob, 'finalizeExecution');
      // Spying on updateAgentState is useful to inspect history at each step if needed,
      // but for this test, checking the final history might be sufficient.
      // const updateAgentStateSpy = vi.spyOn(mockJob, 'updateAgentState').mockReturnThis();


      // Act
      const result = await executor.executeJob(mockJob, mockAgent);

      // Assert
      expect(result.isOk()).toBe(true);
      const executionResult = result.unwrap();
      expect(executionResult.status).toBe('SUCCESS');
      expect(executionResult.message).toContain(successResponseContent);

      expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(2);

      const agentState = mockJob.currentData().agentState;
      const history = agentState.conversationHistory.entries();

      // Expected history:
      // 1. User: Initial prompt
      // 2. Assistant: "Eh?"
      // 3. User: "System Note: Your previous response was empty or too short..." (replan message)
      // 4. Assistant: "Goal achieved after replan..."
      expect(history.length).toBe(4);
      expect(history[0].role()).toBe(HistoryEntryRoleType.USER);
      expect(history[1].role()).toBe(HistoryEntryRoleType.ASSISTANT);
      expect(history[1].content()).toBe(shortResponseContent);
      expect(history[2].role()).toBe(HistoryEntryRoleType.USER);
      expect(history[2].content()).toContain("System Note: Your previous response was empty or too short");
      expect(history[3].role()).toBe(HistoryEntryRoleType.ASSISTANT);
      expect(history[3].content()).toBe(successResponseContent);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(`LLM response for Job ID ${mockJob.id().value()} was empty/too short. Attempting re-plan (1/${MAX_REPLAN_ATTEMPTS_FOR_EMPTY_RESPONSE})`),
        expect.anything()
      );

      expect(finalizeExecutionSpy).toHaveBeenCalledWith(expect.objectContaining({ status: 'SUCCESS' }));
    });

    it('should replan and succeed if initial LLM response has null content and no tool_calls', async () => {
      // Arrange
      const successResponseContent = "Goal achieved after replan from null content.";

      mockLlmAdapter.generateText
        .mockResolvedValueOnce(ok({ role: 'assistant', content: null, tool_calls: [] })) // content: null, no tool_calls
        .mockResolvedValueOnce(ok({ role: 'assistant', content: successResponseContent, tool_calls: [] }));

      const finalizeExecutionSpy = vi.spyOn(mockJob, 'finalizeExecution');

      // Act
      const result = await executor.executeJob(mockJob, mockAgent);

      // Assert
      expect(result.isOk()).toBe(true);
      const executionResult = result.unwrap();
      expect(executionResult.status).toBe('SUCCESS');
      expect(executionResult.message).toContain(successResponseContent);

      expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(2);

      const agentState = mockJob.currentData().agentState;
      const history = agentState.conversationHistory.entries();

      // Expected: User Prompt -> Assistant (null content) -> System/User (replan msg) -> Assistant (success)
      expect(history.length).toBe(4);
      expect(history[1].role()).toBe(HistoryEntryRoleType.ASSISTANT);
      expect(history[1].content()).toBe(""); // Null content becomes empty string in ActivityHistoryEntry
      expect(history[2].role()).toBe(HistoryEntryRoleType.USER);
      expect(history[2].content()).toContain("System Note: Your previous response was empty or too short");
      expect(history[3].role()).toBe(HistoryEntryRoleType.ASSISTANT);
      expect(history[3].content()).toBe(successResponseContent);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(`LLM response for Job ID ${mockJob.id().value()} was empty/too short. Attempting re-plan (1/${MAX_REPLAN_ATTEMPTS_FOR_EMPTY_RESPONSE})`),
        expect.anything()
      );
      expect(finalizeExecutionSpy).toHaveBeenCalledWith(expect.objectContaining({ status: 'SUCCESS' }));
    });

    it('should fail with FAILURE_LLM if LLM response remains unusable after max replan attempts', async () => {
      // Arrange
      // MAX_REPLAN_ATTEMPTS_FOR_EMPTY_RESPONSE is 1, so 1 original call + 1 replan = 2 total LLM calls
      const shortResponse1 = "?";
      const shortResponse2 = "??";

      mockLlmAdapter.generateText
        .mockResolvedValueOnce(ok({ role: 'assistant', content: shortResponse1, tool_calls: [] }))
        .mockResolvedValueOnce(ok({ role: 'assistant', content: shortResponse2, tool_calls: [] }));

      const finalizeExecutionSpy = vi.spyOn(mockJob, 'finalizeExecution');
      const updateLastFailureSummarySpy = vi.spyOn(mockJob, 'updateLastFailureSummary');

      // Act
      const result = await executor.executeJob(mockJob, mockAgent);

      // Assert
      expect(result.isOk()).toBe(true); // Executor itself completes
      const executionResult = result.unwrap();
      expect(executionResult.status).toBe('FAILURE_LLM');
      expect(executionResult.message).toContain('Failed to get a usable response from LLM after maximum replan attempts');
      expect(executionResult.output).toEqual({ message: `Failed to get a usable response from LLM after maximum replan attempts. Last LLM response: ${shortResponse2}` });


      expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(1 + MAX_REPLAN_ATTEMPTS_FOR_EMPTY_RESPONSE); // e.g., 2 times

      const agentState = mockJob.currentData().agentState;
      const history = agentState.conversationHistory.entries();
      // Expected: User -> Assistant (short1) -> User (replan) -> Assistant (short2)
      expect(history.length).toBe(4);
      expect(history[1].content()).toBe(shortResponse1);
      expect(history[2].content()).toContain("System Note: Your previous response was empty or too short");
      expect(history[3].content()).toBe(shortResponse2);

      // ExecutionHistory might log these attempts
      const unusableResponseEvents = agentState.executionHistory.filter(e => e.type === 'unusable_llm_response');
      expect(unusableResponseEvents.length).toBe(2); // One for each unusable response after the first one that triggered replan. Or 1 if only the one triggering replan is logged.
                                                      // The current generic-agent-executor logs it after the fact.
                                                      // Let's check for the log warning.
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(`LLM response for Job ID ${mockJob.id().value()} was empty/too short. Attempting re-plan (1/${MAX_REPLAN_ATTEMPTS_FOR_EMPTY_RESPONSE})`),
        expect.anything()
      );
       expect(mockLogger.warn).toHaveBeenCalledWith( // This is the log after exhausting attempts
        expect.stringContaining(`LLM response for Job ID ${mockJob.id().value()} was empty/too short after ${MAX_REPLAN_ATTEMPTS_FOR_EMPTY_RESPONSE} re-plan attempts. Proceeding with this response.`),
        expect.anything()
      );


      expect(mockJob.status().is(JobStatusType.FAILED)).toBe(true);
      expect(updateLastFailureSummarySpy).toHaveBeenCalledWith(expect.stringContaining('Failed to get a usable response from LLM after maximum replan attempts'));
      expect(finalizeExecutionSpy).toHaveBeenCalledWith(expect.objectContaining({ status: 'FAILURE_LLM' }));
    });
  });
});
