// Vitest
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { mock, DeepMockProxy } from 'vitest-mock-extended';

// Core Service
import { GenericAgentExecutor } from './generic-agent-executor.service';

// Domain Entities & VOs
import { Job } from '@/refactored/core/domain/job/entities/job.entity';
import { Agent } from '@/refactored/core/domain/agent/entities/agent.entity';
import { AgentPersonaTemplate } from '@/refactored/core/domain/agent/value-objects/agent-persona-template.vo';
import { LLMProviderConfigId } from '@/refactored/core/domain/llm-provider-config/value-objects/llm-provider-config-id.vo';
// import { JobId } from '@/refactored/core/domain/job/value-objects/job-id.vo'; // Not directly used in mockJob creation in conceptual plan
import { JobName } from '@/refactored/core/domain/job/value-objects/job-name.vo';
import { JobStatus, JobStatusType } from '@/refactored/core/domain/job/value-objects/job-status.vo';
import { TargetAgentRole } from '@/refactored/core/domain/job/value-objects/target-agent-role.vo';
import { AgentId } from '@/refactored/core/domain/agent/value-objects/agent-id.vo';
import { AgentTemperature } from '@/refactored/core/domain/agent/value-objects/agent-temperature.vo';
import { MaxIterations } from '@/refactored/core/domain/agent/value-objects/max-iterations.vo';
import { PersonaId } from '@/refactored/core/domain/agent/value-objects/persona/persona-id.vo';
import { PersonaName } from '@/refactored/core/domain/agent/value-objects/persona/persona-name.vo';
import { PersonaRole } from '@/refactored/core/domain/agent/value-objects/persona/persona-role.vo';
import { PersonaGoal } from '@/refactored/core/domain/agent/value-objects/persona/persona-goal.vo';
import { PersonaBackstory } from '@/refactored/core/domain/agent/value-objects/persona/persona-backstory.vo';
import { ToolNames } from '@/refactored/core/domain/agent/value-objects/persona/tool-names.vo';

// Ports (Interfaces for Dependencies)
import { ILLMAdapter, LanguageModelMessage } from '@/refactored/core/application/ports/adapters/i-llm.adapter'; // Added LanguageModelMessage
import { IToolRegistryService } from '@/refactored/core/application/ports/services/i-tool-registry.service';
import { IJobRepository } from '@/refactored/core/domain/job/ports/i-job.repository';
import { IAgentInternalStateRepository } from '@/refactored/core/domain/agent/ports/i-agent-internal-state.repository';
import { ILogger } from '@/refactored/core/common/services/i-logger.service';

// Shared Utilities
import { Result, ok, error } from '@/refactored/shared/result'; // Result is used by mockResolvedValue(ok(...))

// Specific VOs for test assertions
import { HistoryEntryRoleType } from '@/refactored/core/domain/job/value-objects/activity-history-entry.vo';

describe('GenericAgentExecutor', () => {
  // Variáveis para mocks e a instância do executor
  let mockLlmAdapter: DeepMockProxy<ILLMAdapter>;
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
});
