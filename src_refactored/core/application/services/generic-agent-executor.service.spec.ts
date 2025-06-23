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
import { Result } from '@/refactored/shared/result';
import { ApplicationError } from '@/refactored/core/application/common/errors';
import { ActivityContext } from '@/refactored/core/domain/job/value-objects/activity-context.vo';
import { ActivityHistory } from '@/refactored/core/domain/job/value-objects/activity-history.vo';
import { AgentPersonaTemplate } from '@/refactored/core/domain/agent/agent-persona-template.vo';
import { PersonaId } from '@/refactored/core/domain/agent/value-objects/persona/persona-id.vo';
import { PersonaName } from '@/refactored/core/domain/agent/value-objects/persona/persona-name.vo';
import { PersonaRole } from '@/refactored/core/domain/agent/value-objects/persona/persona-role.vo';
import { PersonaGoal } from '@/refactored/core/domain/agent/value-objects/persona/persona-goal.vo';
import { LLMProviderConfigId } from '@/refactored/core/domain/llm-provider-config/value-objects/llm-provider-config-id.vo';


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
    const jobProps = {
      name: JobName.create('Test Job').value as JobName,
      payload: { instruction: 'Do something' },
      // Initialize with a basic ActivityContext
      data: {
        context: ActivityContext.create({ history: ActivityHistory.create([]) })
      }
    };
    sampleJob = Job.create(jobProps);

    // Create a sample Agent
     const personaTemplate = AgentPersonaTemplate.create({
      id: PersonaId.generate(),
      name: PersonaName.create('Test Persona').value as PersonaName,
      role: PersonaRole.create('Tester').value as PersonaRole,
      goal: PersonaGoal.create('Test things').value as PersonaGoal,
      backstory: 'Created for testing',
      toolNames: [],
    }).value as AgentPersonaTemplate;

    sampleAgent = Agent.create({
      id: AgentId.generate(),
      personaTemplate,
      llmProviderConfigId: LLMProviderConfigId.generate(),
    }).value as Agent;

    // Mock job's markAsProcessing to return a successful Result with the job itself
    // Vitest's `vi.spyOn` can be used if Job methods are not easily mockable directly
    // For now, we assume the entity method works as expected or test it separately.
    // We will mock the repository save method.
    mockJobRepository.save.mockResolvedValue(Result.ok(undefined)); // Assuming save returns void on success
  });

  it('should be defined', () => {
    expect(executor).toBeDefined();
  });

  describe('executeJob', () => {
    it('should log the start of job execution', async () => {
      await executor.executeJob(sampleJob, sampleAgent);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Executing Job ID: ${sampleJob.id().value} with Agent ID: ${sampleAgent.id().value}`,
        { jobId: sampleJob.id().value, agentId: sampleAgent.id().value },
      );
    });

    it('should return error if job is missing activity context', async () => {
      const jobWithoutContextProps = {
        name: JobName.create('Job Without Context').value as JobName,
        payload: {},
        data: {}, // No context
      };
      const jobWithoutContext = Job.create(jobWithoutContextProps);

      const result = await executor.executeJob(jobWithoutContext, sampleAgent);

      expect(result.isErr()).toBe(true);
      expect(result.error).toBeInstanceOf(ApplicationError);
      expect(result.error?.message).toContain('missing its ActivityContext');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should mark job as PROCESSING and save it', async () => {
      // Spy on the actual job's method to ensure it's called
      const markAsProcessingSpy = vi.spyOn(sampleJob, 'markAsProcessing');

      await executor.executeJob(sampleJob, sampleAgent);

      expect(markAsProcessingSpy).toHaveBeenCalled();
      // Assuming markAsProcessing was successful and returned the (modified) job
      expect(mockJobRepository.save).toHaveBeenCalledWith(sampleJob);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Job ID: ${sampleJob.id().value} marked as PROCESSING and saved.`,
        { jobId: sampleJob.id().value }
      );
       markAsProcessingSpy.mockRestore();
    });

    it('should return PENDING_LLM_RESPONSE on successful initialization', async () => {
      const result = await executor.executeJob(sampleJob, sampleAgent);

      expect(result.isOk()).toBe(true);
      const SUT = result.value; // SUT (System Under Test) is the result value
      expect(SUT.status).toBe('PENDING_LLM_RESPONSE');
      expect(SUT.jobId).toBe(sampleJob.id().value);
      expect(SUT.output?.message).toBe('Job processing initiated.');
      expect(SUT.history).toEqual([]); // Initial history is empty
    });

    it('should return error if job fails to be marked as PROCESSING', async () => {
      const error = new ApplicationError('Failed to mark as processing');
      // Mock the job's method to return an error
      vi.spyOn(sampleJob, 'markAsProcessing').mockReturnValue(Result.err(error));

      const result = await executor.executeJob(sampleJob, sampleAgent);

      expect(result.isErr()).toBe(true);
      expect(result.error).toBe(error);
      expect(mockJobRepository.save).not.toHaveBeenCalled();
      vi.restoreAllMocks(); // Clean up spy
    });

    it('should return error if job repository fails to save', async () => {
      const repoError = new ApplicationError('DB save failed');
      mockJobRepository.save.mockResolvedValue(Result.err(repoError));

      const result = await executor.executeJob(sampleJob, sampleAgent);

      expect(result.isErr()).toBe(true);
      expect(result.error).toBe(repoError);
    });
  });
});
