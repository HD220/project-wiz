// Vitest & external
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { mock, DeepMockProxy } from 'vitest-mock-extended';
import { z } from 'zod';

import { ILogger } from '@/core/common/services/i-logger.service';
import { ILLMAdapter, LanguageModelMessage } from '@/core/ports/adapters/llm-adapter.interface';
import { IAgentTool } from '@/core/tools/tool.interface';

import { AgentPersonaTemplate } from '@/domain/agent/agent-persona-template.vo';
import { Agent } from '@/domain/agent/agent.entity';
import { IAgentInternalStateRepository } from '@/domain/agent/ports/agent-internal-state-repository.interface';
import { AgentId } from '@/domain/agent/value-objects/agent-id.vo';
import { MaxIterations } from '@/domain/agent/value-objects/agent-max-iterations.vo';
import { AgentTemperature } from '@/domain/agent/value-objects/agent-temperature.vo';
import { PersonaBackstory } from '@/domain/agent/value-objects/persona/persona-backstory.vo';
import { PersonaGoal } from '@/domain/agent/value-objects/persona/persona-goal.vo';
import { PersonaId } from '@/domain/agent/value-objects/persona/persona-id.vo';
import { PersonaName } from '@/domain/agent/value-objects/persona/persona-name.vo';
import { PersonaRole } from '@/domain/agent/value-objects/persona/persona-role.vo';
import { ToolNames } from '@/domain/agent/value-objects/persona/tool-names.vo';
import { ToolError } from '@/domain/common/errors';
import { Job, JobEntityProps } from '@/domain/job/job.entity';
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { HistoryEntryRoleType } from '@/domain/job/value-objects/activity-history-entry.vo';
import { JobNameVO } from '@/domain/job/value-objects/job-name.vo';
import { JobStatusVO, JobStatusEnum } from '@/domain/job/value-objects/job-status.vo';
import { TargetAgentRoleVO } from '@/domain/job/value-objects/target-agent-role.vo';
import { LLMProviderConfigId } from '@/domain/llm-provider-config/value-objects/llm-provider-config-id.vo';

import { ApplicationError } from '@/application/common/errors';
import { IToolRegistryService } from '@/application/ports/services/i-tool-registry.service';

import { ok, error } from '@/shared/result';

// Core Service (relative import)
import { GenericAgentExecutor } from './generic-agent-executor.service';

describe('GenericAgentExecutor', () => {
  // Variáveis para mocks e a instância do executor
  let mockLlmAdapter: DeepMockProxy<ILLMAdapter>;
  let mockSuccessfulTool: DeepMockProxy<IAgentTool<z.ZodTypeAny, unknown>>;
  let mockRecoverableErrorTool: DeepMockProxy<IAgentTool<z.ZodTypeAny, unknown>>;
  let mockNonRecoverableErrorTool: DeepMockProxy<IAgentTool<z.ZodTypeAny, unknown>>;
  let mockValidationTestTool: DeepMockProxy<IAgentTool<z.ZodTypeAny, unknown>>; // Added
  let mockToolRegistryService: DeepMockProxy<IToolRegistryService>;
  let mockJobRepository: DeepMockProxy<IJobRepository>;
  let mockAgentInternalStateRepository: DeepMockProxy<IAgentInternalStateRepository>;
  let mockLogger: DeepMockProxy<ILogger>;
  let executor: GenericAgentExecutor;

  // Variáveis para instâncias mock/reais de Job e Agent
  let mockJob: Job;
  let mockAgent: Agent;
  let mockPersonaTemplate: AgentPersonaTemplate;

  beforeEach(() => {
    mockLlmAdapter = mock<ILLMAdapter>();
    mockToolRegistryService = mock<IToolRegistryService>();

    mockSuccessfulTool = mock<IAgentTool<z.ZodTypeAny, unknown>>();
    mockSuccessfulTool.name = 'mockSuccessTool';
    mockSuccessfulTool.description = 'A mock tool that always succeeds.';
    mockSuccessfulTool.parameters = z.object({ param1: z.string().optional() });
    mockSuccessfulTool.execute.mockResolvedValue(ok({ toolOutput: 'value from successful tool' }));

    mockRecoverableErrorTool = mock<IAgentTool<z.ZodTypeAny, unknown>>();
    mockRecoverableErrorTool.name = 'recoverableErrorTool';
    mockRecoverableErrorTool.description = 'A mock tool that returns a recoverable error.';
    mockRecoverableErrorTool.parameters = z.object({ data: z.string() });
    const recoverableError = new ToolError(
      'Simulated recoverable error from tool',
      'recoverableErrorTool',
      new Error('Original error detail for recoverable'),
      true,
    );
    mockRecoverableErrorTool.execute.mockResolvedValue(error(recoverableError));

    mockNonRecoverableErrorTool = mock<IAgentTool<z.ZodTypeAny, unknown>>();
    mockNonRecoverableErrorTool.name = 'nonRecoverableErrorTool';
    mockNonRecoverableErrorTool.description = 'A mock tool that returns a non-recoverable error.';
    mockNonRecoverableErrorTool.parameters = z.object({ criticalParam: z.string() });
    const nonRecoverableError = new ToolError(
      'Simulated CRITICAL non-recoverable error',
      'nonRecoverableErrorTool',
      new Error('Underlying cause of critical failure'),
      false,
    );
    mockNonRecoverableErrorTool.execute.mockResolvedValue(error(nonRecoverableError));

    mockValidationTestTool = mock<IAgentTool<z.ZodTypeAny, unknown>>();
    mockValidationTestTool.name = 'validationTestTool';
    mockValidationTestTool.description = 'A mock tool with specific argument validation.';
    mockValidationTestTool.parameters = z.object({ requiredParam: z.string().min(3) });
    mockValidationTestTool.execute.mockResolvedValue(ok({ output: 'should not be called if validation fails' }));

    mockJobRepository = mock<IJobRepository>();
    mockAgentInternalStateRepository = mock<IAgentInternalStateRepository>();
    mockLogger = mock<ILogger>();

    mockLogger.info.mockReturnValue();
    mockLogger.warn.mockReturnValue();
    mockLogger.error.mockReturnValue();
    mockLogger.debug.mockReturnValue();

    executor = new GenericAgentExecutor(
      mockLlmAdapter,
      mockToolRegistryService,
      mockJobRepository,
      mockAgentInternalStateRepository,
      mockLogger,
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
      llmProviderConfigId: LLMProviderConfigId.generate(),
      temperature: AgentTemperature.create(0.5).unwrap(),
      maxIterations: MaxIterations.create(5).unwrap(),
    }).unwrap();

    const jobProps: JobEntityProps<unknown, unknown> = {
      name: JobNameVO.create('Initial Test Job').unwrap(),
      payload: { initialPrompt: 'Test the executor setup.' },
      targetAgentRole: TargetAgentRoleVO.create('TestAgent').unwrap(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any; // Simplified for test setup
    mockJob = Job.create(jobProps).unwrap();

    mockJobRepository.save.mockResolvedValue(ok(mockJob as Job<unknown, unknown>));
    vi.spyOn(mockJob, 'moveToActive').mockReturnValue(true);
    vi.spyOn(mockJob, 'status', 'get').mockReturnValue(JobStatusVO.pending());
  });

  it('should be created successfully with mocked dependencies', () => {
    expect(executor).toBeInstanceOf(GenericAgentExecutor);
  });

  it('should successfully execute a simple job without tool_calls when LLM indicates goal achieved', async () => {
    const llmResponseContent = 'Goal achieved. Task is complete.';
    mockLlmAdapter.generateText.mockResolvedValueOnce(
      ok({
        role: 'assistant',
        content: llmResponseContent,
        tool_calls: [],
      } as LanguageModelMessage),
    );

    vi.spyOn(mockJob, 'updateAgentState').mockReturnThis();
    const finalizeExecutionSpy = vi.spyOn(mockJob, 'finalizeExecution');

    const result = await executor.executeJob(mockJob, mockAgent);

    expect(result.isOk()).toBe(true);
    const executionResult = result.unwrap();
    expect(executionResult.status).toBe('SUCCESS');
    expect(executionResult.message).toContain(llmResponseContent);
    expect(executionResult.output).toEqual({ message: llmResponseContent });

    expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(1);
    const generateTextArgs = mockLlmAdapter.generateText.mock.calls[0];
    const messagesArg = generateTextArgs[0];
    expect(messagesArg).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: 'system' }),
        expect.objectContaining({ role: 'user', content: 'Test the executor setup.' }),
      ]),
    );
    expect(generateTextArgs[1]).toEqual({ temperature: 0.5 });

    expect(mockJob.status().is(JobStatusEnum.COMPLETED)).toBe(true);
    expect(finalizeExecutionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'SUCCESS',
        message: llmResponseContent,
      }),
    );

    const agentState = mockJob.currentData().agentState;
    const history = agentState.conversationHistory.entries();
    expect(history.length).toBe(2);
    expect(history[0].role()).toBe(HistoryEntryRoleType.USER);
    expect(history[1].role()).toBe(HistoryEntryRoleType.ASSISTANT);
    expect(history[1].content()).toBe(llmResponseContent);
    expect(history[1].props.tool_calls).toBeUndefined();

    expect(agentState.executionHistory).toEqual([]);

    expect(mockJobRepository.save).toHaveBeenCalledTimes(2);
    expect(vi.mocked(mockJobRepository.save).mock.calls[0][0].status().is(JobStatusEnum.ACTIVE)).toBe(true);
    expect(vi.mocked(mockJobRepository.save).mock.calls[1][0].status().is(JobStatusEnum.COMPLETED)).toBe(true);

    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`Executing Job ID: ${mockJob.id().value}`), expect.anything());
  });

  it('should finish with FAILURE_MAX_ITERATIONS when maxIterations is reached', async () => {
    const maxIter = 3;
    const lowIterationAgent = Agent.create({
      id: AgentId.generate(),
      personaTemplate: mockAgent.personaTemplate(),
      llmProviderConfigId: mockAgent.llmProviderConfigId(),
      temperature: AgentTemperature.create(0.7).unwrap(),
      maxIterations: MaxIterations.create(maxIter).unwrap(),
    }).unwrap();

    mockLlmAdapter.generateText.mockResolvedValue(
      ok({
        role: 'assistant',
        content: 'Still thinking...',
        tool_calls: [],
      } as LanguageModelMessage),
    );

    vi.spyOn(mockJob, 'updateAgentState').mockReturnThis();
    const finalizeExecutionSpy = vi.spyOn(mockJob, 'finalizeExecution');
    // const updateLastFailureSummarySpy = vi.spyOn(mockJob, 'updateLastFailureSummary'); // unused spy

    const result = await executor.executeJob(mockJob, lowIterationAgent);

    expect(result.isOk()).toBe(true);
    const executionResult = result.unwrap();
    expect(executionResult.status).toBe('FAILURE_MAX_ITERATIONS');
    expect(executionResult.message).toContain(`Max iterations (${maxIter}) reached.`);
    expect(executionResult.output).toEqual({ message: `Max iterations (${maxIter}) reached. Goal not achieved. Last LLM response: Still thinking...` });

    expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(maxIter);
    expect(mockJob.status().is(JobStatusEnum.FAILED)).toBe(true);
    // expect(updateLastFailureSummarySpy).toHaveBeenCalledWith(expect.stringContaining(`Max iterations (${maxIter}) reached.`));
    expect(finalizeExecutionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'FAILURE_MAX_ITERATIONS',
        message: expect.stringContaining(`Max iterations (${maxIter}) reached`),
      }),
    );

    const agentState = mockJob.currentData().agentState;
    const history = agentState.conversationHistory.entries();
    expect(history.length).toBe(1 + maxIter);

    const lastSaveCall = vi.mocked(mockJobRepository.save).mock.calls.pop();
    expect(lastSaveCall).toBeDefined();
    if (lastSaveCall) {
      expect(lastSaveCall[0].status().is(JobStatusEnum.FAILED)).toBe(true);
    }

    expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining(`Max iterations (${maxIter}) reached for Job ID: ${mockJob.id().value()}`), expect.anything());
  });

  it('should finish with FAILURE_LLM when ILLMAdapter.generateText returns an error', async () => {
    const simulatedError = new ApplicationError('Simulated LLM API Error');
    mockLlmAdapter.generateText.mockResolvedValueOnce(error(simulatedError));

    vi.spyOn(mockJob, 'updateAgentState').mockReturnThis();
    const finalizeExecutionSpy = vi.spyOn(mockJob, 'finalizeExecution');
    // const updateLastFailureSummarySpy = vi.spyOn(mockJob, 'updateLastFailureSummary'); // unused spy

    const result = await executor.executeJob(mockJob, mockAgent);

    expect(result.isOk()).toBe(true);
    const executionResult = result.unwrap();
    expect(executionResult.status).toBe('FAILURE_LLM');
    expect(executionResult.message).toContain('LLM generation failed: Simulated LLM API Error');
    expect(executionResult.output).toEqual({ message: 'LLM generation failed: Simulated LLM API Error' });

    expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(1);
    expect(mockJob.status().is(JobStatusEnum.FAILED)).toBe(true);
    expect(finalizeExecutionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'FAILURE_LLM',
        message: expect.stringContaining('Simulated LLM API Error'),
      }),
    );

    const agentState = mockJob.currentData().agentState;
    const errorEntry = agentState.executionHistory.find((e) => e.type === 'llm_error');
    expect(errorEntry).toBeDefined();
    expect(errorEntry?.error).toContain('Simulated LLM API Error');

    const lastSaveCall = vi.mocked(mockJobRepository.save).mock.calls.pop();
    if (lastSaveCall) {
      expect(lastSaveCall[0].status().is(JobStatusEnum.FAILED)).toBe(true);
    }

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('LLM generation failed'), simulatedError, expect.anything());
  });

  it('should successfully execute a job with a successful tool_call and continue LLM interaction to completion', async () => {
    const toolCallId = 'toolCallId123';
    const toolName = 'mockSuccessTool';
    const toolArgsString = '{"param1": "test"}';
    const toolArgsObject = { param1: 'test' };
    const toolOutput = { toolOutput: 'value from successful tool' };

    mockToolRegistryService.getTool.calledWith(toolName).mockResolvedValue(ok(mockSuccessfulTool));

    mockLlmAdapter.generateText
      .mockResolvedValueOnce(
        ok({
          role: 'assistant',
          content: null,
          tool_calls: [{ id: toolCallId, type: 'function', function: { name: toolName, arguments: toolArgsString } }],
        } as LanguageModelMessage),
      )
      .mockResolvedValueOnce(
        ok({
          role: 'assistant',
          content: 'Goal achieved after using mockSuccessTool.',
          tool_calls: [],
        } as LanguageModelMessage),
      );

    vi.spyOn(mockJob, 'updateAgentState').mockReturnThis();
    const finalizeExecutionSpy = vi.spyOn(mockJob, 'finalizeExecution');

    const result = await executor.executeJob(mockJob, mockAgent);

    expect(result.isOk()).toBe(true);
    const executionResult = result.unwrap();
    expect(executionResult.status).toBe('SUCCESS');
    expect(executionResult.message).toContain('Goal achieved after using mockSuccessTool.');

    expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(2);
    expect(mockSuccessfulTool.execute).toHaveBeenCalledWith(toolArgsObject, expect.objectContaining({ jobId: mockJob.id().value() }));
    expect(mockJob.status().is(JobStatusEnum.COMPLETED)).toBe(true);
    expect(finalizeExecutionSpy).toHaveBeenCalledWith(expect.objectContaining({ status: 'SUCCESS' }));

    const agentState = mockJob.currentData().agentState;
    const history = agentState.conversationHistory.entries();
    expect(history.length).toBe(4); // User, Assistant (tool_call), Tool Result, Assistant (final)
    expect(history[2].role()).toBe(HistoryEntryRoleType.TOOL_RESULT);
    expect(history[2].content()).toBe(JSON.stringify(toolOutput));

    const execHistory = agentState.executionHistory;
    const toolEntry = execHistory.find((e) => e.name === toolName && e.type === 'tool_call');
    expect(toolEntry).toBeDefined();
    expect(toolEntry?.result).toEqual(toolOutput);

    const lastSaveCall = vi.mocked(mockJobRepository.save).mock.calls.pop();
    if (lastSaveCall) {
      expect(lastSaveCall[0].status().is(JobStatusEnum.COMPLETED)).toBe(true);
    }
  });

  it('should handle a recoverable ToolError, add error to history, and call LLM again for replanning', async () => {
    const toolCallId = 'toolCallId456';
    const toolName = 'recoverableErrorTool';
    const toolArgsString = '{"data": "some input"}';
    const recoverableErrorInst = new ToolError('Simulated recoverable error', toolName, new Error('detail'), true);
    mockRecoverableErrorTool.execute.mockResolvedValue(error(recoverableErrorInst));
    mockToolRegistryService.getTool.calledWith(toolName).mockResolvedValue(ok(mockRecoverableErrorTool));

    mockLlmAdapter.generateText
      .mockResolvedValueOnce(
        ok({
          role: 'assistant',
          content: null,
          tool_calls: [{ id: toolCallId, type: 'function', function: { name: toolName, arguments: toolArgsString } }],
        } as LanguageModelMessage),
      )
      .mockResolvedValueOnce(
        ok({
          role: 'assistant',
          content: 'Goal achieved after LLM replanned.',
          tool_calls: [],
        } as LanguageModelMessage),
      );
    // const finalizeExecutionSpy = vi.spyOn(mockJob, 'finalizeExecution'); // unused spy

    const result = await executor.executeJob(mockJob, mockAgent);

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().status).toBe('SUCCESS');
    expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(2);
    const secondLlmCallArgs = mockLlmAdapter.generateText.mock.calls[1][0];
    expect(secondLlmCallArgs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: 'tool', tool_call_id: toolCallId, content: JSON.stringify(recoverableErrorInst.toPlainObject()) }),
      ]),
    );
    expect(mockRecoverableErrorTool.execute).toHaveBeenCalledTimes(1);
    expect(mockJob.status().is(JobStatusEnum.COMPLETED)).toBe(true);

    const agentState = mockJob.currentData().agentState;
    const history = agentState.conversationHistory.entries();
    expect(history.length).toBe(4);
    expect(history[2].role()).toBe(HistoryEntryRoleType.TOOL_RESULT);
    expect(JSON.parse(history[2].content()!)).toEqual(recoverableErrorInst.toPlainObject());

    const execHistory = agentState.executionHistory;
    const toolErrorEntry = execHistory.find((e) => e.name === toolName && e.type === 'tool_error');
    expect(toolErrorEntry).toBeDefined();
    expect(toolErrorEntry?.isCritical).toBe(false);

    expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining(`Tool ${toolName} execution failed for Job ID: ${mockJob.id().value()} but was recoverable.`), recoverableErrorInst, expect.anything());
  });

  it('should handle a non-recoverable (critical) ToolError and finish with FAILURE_TOOL', async () => {
    const toolCallId = 'toolCallCrit789';
    const toolName = 'nonRecoverableErrorTool';
    const toolArgsString = '{"criticalParam": "trigger"}';
    const nonRecoverableErrorInst = new ToolError('Simulated CRITICAL error', toolName, new Error('detail'), false);
    mockNonRecoverableErrorTool.execute.mockResolvedValue(error(nonRecoverableErrorInst));
    mockToolRegistryService.getTool.calledWith(toolName).mockResolvedValue(ok(mockNonRecoverableErrorTool));

    mockLlmAdapter.generateText.mockResolvedValueOnce(
      ok({
        role: 'assistant',
        content: null,
        tool_calls: [{ id: toolCallId, type: 'function', function: { name: toolName, arguments: toolArgsString } }],
      } as LanguageModelMessage),
    );

    const finalizeExecutionSpy = vi.spyOn(mockJob, 'finalizeExecution');
    const updateCriticalToolFailureInfoSpy = vi.spyOn(mockJob, 'updateCriticalToolFailureInfo');

    const result = await executor.executeJob(mockJob, mockAgent);

    expect(result.isOk()).toBe(true);
    const executionResult = result.unwrap();
    expect(executionResult.status).toBe('FAILURE_TOOL');
    expect(executionResult.message).toContain(`Critical: Tool '${toolName}' failed non-recoverably`);

    expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(1);
    expect(mockNonRecoverableErrorTool.execute).toHaveBeenCalledTimes(1);
    expect(mockJob.status().is(JobStatusEnum.FAILED)).toBe(true);
    expect(updateCriticalToolFailureInfoSpy).toHaveBeenCalledWith(expect.objectContaining({ toolName, isRecoverable: false }));
    expect(finalizeExecutionSpy).toHaveBeenCalledWith(expect.objectContaining({ status: 'FAILURE_TOOL' }));

    const agentState = mockJob.currentData().agentState;
    const execHistory = agentState.executionHistory;
    const toolErrorEntry = execHistory.find((e) => e.name === toolName && e.type === 'tool_error');
    expect(toolErrorEntry).toBeDefined();
    expect(toolErrorEntry?.isCritical).toBe(true);

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining(`Tool ${toolName} execution failed critically`), nonRecoverableErrorInst, expect.anything());
  });

  it('should handle "Tool not found" error and finish with FAILURE_TOOL', async () => {
    const nonExistentToolName = 'nonExistentTool';
    const toolCallId = 'toolCallNotFound789';
    mockToolRegistryService.getTool.calledWith(nonExistentToolName).mockResolvedValue(error(new ApplicationError(`Tool '${nonExistentToolName}' not found.`)));

    mockLlmAdapter.generateText.mockResolvedValueOnce(
      ok({
        role: 'assistant',
        content: null,
        tool_calls: [{ id: toolCallId, type: 'function', function: { name: nonExistentToolName, arguments: '{}' } }],
      } as LanguageModelMessage),
    );

    const finalizeExecutionSpy = vi.spyOn(mockJob, 'finalizeExecution');
    const updateCriticalToolFailureInfoSpy = vi.spyOn(mockJob, 'updateCriticalToolFailureInfo');

    const result = await executor.executeJob(mockJob, mockAgent);

    expect(result.isOk()).toBe(true);
    const executionResult = result.unwrap();
    expect(executionResult.status).toBe('FAILURE_TOOL');
    expect(executionResult.message).toContain(`Tool '${nonExistentToolName}' not found`);

    expect(mockToolRegistryService.getTool).toHaveBeenCalledWith(nonExistentToolName);
    expect(mockJob.status().is(JobStatusEnum.FAILED)).toBe(true);
    expect(updateCriticalToolFailureInfoSpy).toHaveBeenCalledWith(expect.objectContaining({ toolName: nonExistentToolName, isRecoverable: false }));
    expect(finalizeExecutionSpy).toHaveBeenCalledWith(expect.objectContaining({ status: 'FAILURE_TOOL' }));

    const agentState = mockJob.currentData().agentState;
    const execHistory = agentState.executionHistory;
    const toolErrorEntry = execHistory.find((e) => e.name === nonExistentToolName && e.type === 'tool_error');
    expect(toolErrorEntry).toBeDefined();
    expect(toolErrorEntry?.isCritical).toBe(true);

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining(`Tool ${nonExistentToolName} execution failed critically`), expect.any(ToolError), expect.anything());
  });

  it('should handle tool argument validation failure and call LLM again', async () => {
    const toolCallId = 'toolCallValFail1';
    const toolName = 'validationTestTool';
    const invalidToolArgsString = '{"requiredParam": "a"}'; // "a" is < min(3)

    mockToolRegistryService.getTool.calledWith(toolName).mockResolvedValue(ok(mockValidationTestTool));

    mockLlmAdapter.generateText
      .mockResolvedValueOnce(
        ok({
          role: 'assistant',
          content: null,
          tool_calls: [{ id: toolCallId, type: 'function', function: { name: toolName, arguments: invalidToolArgsString } }],
        } as LanguageModelMessage),
      )
      .mockResolvedValueOnce(
        ok({
          role: 'assistant',
          content: 'Goal achieved after LLM corrected tool arguments.',
          tool_calls: [],
        } as LanguageModelMessage),
      );

    const result = await executor.executeJob(mockJob, mockAgent);

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().status).toBe('SUCCESS');
    expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(2);
    const secondLlmCallArgs = mockLlmAdapter.generateText.mock.calls[1][0];
    const toolResultErrorMessage = secondLlmCallArgs.find((m: LanguageModelMessage) => m.role === 'tool' && m.tool_call_id === toolCallId);
    expect(toolResultErrorMessage).toBeDefined();
    expect(toolResultErrorMessage?.content).toContain('Argument validation failed');
    expect(mockValidationTestTool.execute).not.toHaveBeenCalled();
    expect(mockJob.status().is(JobStatusEnum.COMPLETED)).toBe(true);

    const agentState = mockJob.currentData().agentState;
    const execHistory = agentState.executionHistory;
    const toolErrorEntry = execHistory.find((e) => e.name === toolName && e.type === 'tool_error');
    expect(toolErrorEntry).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(toolErrorEntry?.error?.isRecoverable).toBe(true);

    expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining(`Argument validation failed for tool '${toolName}'`), expect.any(ToolError), expect.anything());
  });

  describe('Replan Logic for Unusable LLM Responses', () => {
    const MAX_REPLAN_ATTEMPTS_FOR_EMPTY_RESPONSE = 1;

    it('should replan and succeed if initial LLM response is too short', async () => {
      const shortResponseContent = 'Eh?';
      const successResponseContent = 'Goal achieved after replan.';

      mockLlmAdapter.generateText
        .mockResolvedValueOnce(ok({ role: 'assistant', content: shortResponseContent, tool_calls: [] } as LanguageModelMessage))
        .mockResolvedValueOnce(ok({ role: 'assistant', content: successResponseContent, tool_calls: [] } as LanguageModelMessage));

      const result = await executor.executeJob(mockJob, mockAgent);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap().status).toBe('SUCCESS');
      expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(2);
      const agentState = mockJob.currentData().agentState;
      const history = agentState.conversationHistory.entries();
      expect(history.length).toBe(4); // User, Assistant (short), User (replan), Assistant (success)
      expect(history[2].content()).toContain('System Note: Your previous response was empty or too short');
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('LLM response for Job ID'), expect.anything());
    });

    it('should fail with FAILURE_LLM if LLM response remains unusable after max replan attempts', async () => {
      const shortResponse1 = '?';
      const shortResponse2 = '??';

      mockLlmAdapter.generateText
        .mockResolvedValueOnce(ok({ role: 'assistant', content: shortResponse1, tool_calls: [] } as LanguageModelMessage))
        .mockResolvedValueOnce(ok({ role: 'assistant', content: shortResponse2, tool_calls: [] } as LanguageModelMessage));

      const result = await executor.executeJob(mockJob, mockAgent);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap().status).toBe('FAILURE_LLM');
      expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(1 + MAX_REPLAN_ATTEMPTS_FOR_EMPTY_RESPONSE);
      expect(mockJob.status().is(JobStatusEnum.FAILED)).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('LLM response for Job ID'), expect.anything());
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Proceeding with this response.'), expect.anything());
    });
  });
});
