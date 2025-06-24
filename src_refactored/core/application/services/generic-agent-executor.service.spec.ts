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
import { ILLMAdapter } from '@/refactored/core/application/ports/adapters/i-llm.adapter';
import { IToolRegistryService } from '@/refactored/core/application/ports/services/i-tool-registry.service';
import { IJobRepository } from '@/refactored/core/domain/job/ports/i-job.repository';
import { IAgentInternalStateRepository } from '@/refactored/core/domain/agent/ports/i-agent-internal-state.repository';
import { ILogger } from '@/refactored/core/common/services/i-logger.service';

// Shared Utilities
import { Result, ok, error } from '@/refactored/shared/result'; // Result is used by mockResolvedValue(ok(...))

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
});
