// src_refactored/core/application/use-cases/job/create-job.use-case.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ZodError } from 'zod';

import { CreateJobUseCase } from './create-job.use-case';
import { CreateJobUseCaseInput } from './create-job.schema';
import { ValueError, DomainError } from '@/domain/common/errors';
import { IJobQueue } from '@/core/ports/adapters/job-queue.interface';
import { Job } from '@/domain/job/job.entity';
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { JobIdVO } from '@/domain/job/value-objects/job-id.vo';
import { JobPriorityVO } from '@/domain/job/value-objects/job-priority.vo';
import { NoRetryPolicyVO, RetryPolicyVO, BackoffTypeEnum } from '@/domain/job/value-objects/retry-policy.vo';
// import { JobStatusEnum } from '@/domain/job/value-objects/job-status.vo'; // Not directly used, but for context
import { JobNameVO } from '@/domain/job/value-objects/job-name.vo';
import { ok, error } from '@/shared/result';

// Mock Repositories and Queue
const mockJobRepository: IJobRepository = {
  save: vi.fn(),
  findById: vi.fn(), // Not used in this use case directly for now
  findAll: vi.fn(),  // Not used
  // Add other methods if they become needed by other use cases or future tests
  update: vi.fn(),
  delete: vi.fn(),
  findPendingJobsWithNoDependencies: vi.fn(),
  findActiveJobsByWorker: vi.fn(),
  findJobsByStatus: vi.fn(),
  findStaleActiveJobs: vi.fn(),
};

const mockJobQueue: IJobQueue = {
  add: vi.fn(),
  getNext: vi.fn(), // Not used
  complete: vi.fn(), // Not used
  fail: vi.fn(), // Not used
  delay: vi.fn(), // Not used
  getJobById: vi.fn(), // Not used
};


describe('CreateJobUseCase', () => {
  let useCase: CreateJobUseCase;

  beforeEach(() => {
    vi.resetAllMocks(); // Clear mocks between tests
    useCase = new CreateJobUseCase(mockJobRepository, mockJobQueue);
  });

  const baseValidInput: CreateJobUseCaseInput = {
    name: 'Test Job Alpha',
    targetAgentRole: 'test_agent',
    payload: { data: 'sample' },
  };

  it('should successfully create a Job entity with minimal valid inputs', async () => {
    const result = await useCase.execute(baseValidInput);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.jobId).toBeTypeOf('string');
      // Further checks on the created jobEntity would require exposing it or more complex setup.
      // For this sub-task, confirming successful execution and jobId is sufficient.
    }
    expect(mockJobRepository.save).toHaveBeenCalledTimes(1);
    expect(mockJobQueue.add).toHaveBeenCalledTimes(1);
    // Check that the same job entity instance was passed to save and add
    const jobEntityArgToSave = (mockJobRepository.save as vi.Mock).mock.calls[0][0];
    const jobEntityArgToQueue = (mockJobQueue.add as vi.Mock).mock.calls[0][0];
    expect(jobEntityArgToSave).toBeInstanceOf(Job);
    expect(jobEntityArgToQueue).toBe(jobEntityArgToSave);
  });

  it('should create Job with default priority if not specified and save/enqueue', async () => {
    (mockJobRepository.save as vi.Mock).mockResolvedValue(ok(undefined as void));
    (mockJobQueue.add as vi.Mock).mockResolvedValue(ok(undefined as void));
    const result = await useCase.execute(baseValidInput);
    expect(result.isOk()).toBe(true);
    expect(mockJobRepository.save).toHaveBeenCalledTimes(1);
    expect(mockJobQueue.add).toHaveBeenCalledTimes(1);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job<unknown, unknown>;
    expect(savedJob.priority().value).toBe(JobPriorityVO.NORMAL); // Check default
  });

  it('should create Job with specified priority and save/enqueue', async () => {
    (mockJobRepository.save as vi.Mock).mockResolvedValue(ok(undefined as void));
    (mockJobQueue.add as vi.Mock).mockResolvedValue(ok(undefined as void));
    const inputWithPriority = { ...baseValidInput, priority: JobPriorityVO.HIGH };
    const result = await useCase.execute(inputWithPriority);
    expect(result.isOk()).toBe(true);
    expect(mockJobRepository.save).toHaveBeenCalledTimes(1);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job<unknown, unknown>;
    expect(savedJob.priority().value).toBe(JobPriorityVO.HIGH);
  });

  it('should create Job with NoRetryPolicy if retryPolicy is not specified and save/enqueue', async () => {
    (mockJobRepository.save as vi.Mock).mockResolvedValue(ok(undefined as void));
    (mockJobQueue.add as vi.Mock).mockResolvedValue(ok(undefined as void));
    const result = await useCase.execute(baseValidInput);
    expect(result.isOk()).toBe(true);
    expect(mockJobRepository.save).toHaveBeenCalledTimes(1);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job<unknown, unknown>;
    expect(savedJob.retryPolicy()).toBeInstanceOf(NoRetryPolicyVO);
  });

  it('should create Job with NoRetryPolicy if maxAttempts is 0 and save/enqueue', async () => {
    (mockJobRepository.save as vi.Mock).mockResolvedValue(ok(undefined as void));
    (mockJobQueue.add as vi.Mock).mockResolvedValue(ok(undefined as void));
    const input = { ...baseValidInput, retryPolicy: { maxAttempts: 0 } };
    const result = await useCase.execute(input);
    expect(result.isOk()).toBe(true);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job<unknown, unknown>;
    expect(savedJob.retryPolicy()).toBeInstanceOf(NoRetryPolicyVO);
  });

  it('should create Job with NoRetryPolicy if maxAttempts is 1 and save/enqueue', async () => {
    (mockJobRepository.save as vi.Mock).mockResolvedValue(ok(undefined as void));
    (mockJobQueue.add as vi.Mock).mockResolvedValue(ok(undefined as void));
    const input = { ...baseValidInput, retryPolicy: { maxAttempts: 1 } };
    const result = await useCase.execute(input);
    expect(result.isOk()).toBe(true);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job<unknown, unknown>;
    expect(savedJob.retryPolicy()).toBeInstanceOf(NoRetryPolicyVO);
  });

  it('should create Job with a specific RetryPolicy if parameters are provided and save/enqueue', async () => {
    (mockJobRepository.save as vi.Mock).mockResolvedValue(ok(undefined as void));
    (mockJobQueue.add as vi.Mock).mockResolvedValue(ok(undefined as void));
    const inputWithRetry: CreateJobUseCaseInput = {
      ...baseValidInput,
      retryPolicy: {
        maxAttempts: 3,
        initialDelaySeconds: 10,
        backoffType: BackoffTypeEnum.EXPONENTIAL, // Use BackoffTypeEnum
        maxDelaySeconds: 60,
      },
    };
    const result = await useCase.execute(inputWithRetry);
    expect(result.isOk()).toBe(true);
  });

  it('should create Job with default backoffType if only maxAttempts and initialDelay are provided for retryPolicy', async () => {
    const inputWithPartialRetry: CreateJobUseCaseInput = {
      ...baseValidInput,
      retryPolicy: {
        maxAttempts: 2,
        initialDelaySeconds: 5,
      },
    };
    const result = await useCase.execute(inputWithPartialRetry);
    expect(result.isOk()).toBe(true);
    // Job.create internally defaults to RetryPolicy.defaultFixed or similar if only some params given,
    // or the use case's logic for constructing RetryPolicy handles defaults.
    // Current use case logic defaults backoffType to FIXED if not provided.
    expect(mockJobRepository.save).toHaveBeenCalledTimes(1);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job<unknown, unknown>;
    expect(savedJob.retryPolicy()).toBeInstanceOf(RetryPolicyVO);
    expect(savedJob.retryPolicy().maxAttempts().value).toBe(2);
  });


  it('should create Job with specified dependsOnJobIds and save/enqueue', async () => {
    (mockJobRepository.save as vi.Mock).mockResolvedValue(ok(undefined as void));
    (mockJobQueue.add as vi.Mock).mockResolvedValue(ok(undefined as void));
    const depId1 = JobIdVO.generate().value; // Use JobIdVO
    const depId2 = JobIdVO.generate().value; // Use JobIdVO
    const inputWithDeps: CreateJobUseCaseInput = {
      ...baseValidInput,
      dependsOnJobIds: [depId1, depId2],
    };
    const result = await useCase.execute(inputWithDeps);
    expect(result.isOk()).toBe(true);
    expect(mockJobRepository.save).toHaveBeenCalledTimes(1);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job<unknown, unknown>;
    expect(savedJob.dependsOn()?.list().map(id => id.value)).toEqual([depId1, depId2]);
  });

  it('should default payload to {} if null or undefined and save/enqueue', async () => {
    (mockJobRepository.save as vi.Mock).mockResolvedValue(ok(undefined as void));
    (mockJobQueue.add as vi.Mock).mockResolvedValue(ok(undefined as void));

    const input1 = { ...baseValidInput, payload: null };
    const result1 = await useCase.execute(input1);
    expect(result1.isOk()).toBe(true);
    expect(mockJobRepository.save).toHaveBeenCalledTimes(1);
    const savedJob1 = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job<unknown, unknown>;
    expect(savedJob1.payload()).toEqual({});

    vi.clearAllMocks();

    const input2 = { ...baseValidInput, payload: undefined };
    const result2 = await useCase.execute(input2);
    expect(result2.isOk()).toBe(true);
    expect(mockJobRepository.save).toHaveBeenCalledTimes(1);
    const savedJob2 = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job<unknown, unknown>;
    expect(savedJob2.payload()).toEqual({});
  });


  it('should return ZodError for invalid input (e.g., name too short)', async () => {
    const invalidInput = { ...baseValidInput, name: '' };
    const result = await useCase.execute(invalidInput);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(ZodError);
      expect(result.value.errors[0].message).toBe("Job name must be at least 1 character long.");
    }
  });

  it('should return ZodError for invalid targetAgentRole format', async () => {
    const invalidInput = { ...baseValidInput, targetAgentRole: 'test agent!' };
    const result = await useCase.execute(invalidInput);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(ZodError);
      expect(result.value.errors[0].message).toContain("Target agent role has an invalid format");
    }
  });

  it('should return ValueError if a VO creation fails (e.g., JobName with invalid chars not caught by Zod regex)', async () => {
    // This requires a case where Zod passes but VO fails.
    // Our JobName regex in Zod is /^[a-zA-Z0-9_-\s]+$/.
    // The VO has the same regex. So this specific path is hard to test without different regexes.
    // Let's mock JobName.create to throw for demonstration.
    const originalJobNameCreate = JobNameVO.create; // Use JobNameVO
    JobNameVO.create = vi.fn().mockImplementation(() => { // Use JobNameVO
      throw new ValueError("Mocked JobName creation error");
    });

    const result = await useCase.execute(baseValidInput);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(ValueError);
      expect(result.value.message).toBe("Mocked JobName creation error");
    }
    JobNameVO.create = originalJobNameCreate; // Restore with JobNameVO
  });

  it('should return DomainError if jobRepository.save fails', async () => {
    (mockJobRepository.save as vi.Mock).mockResolvedValue(error(new DomainError('Repo save failed') as Error)); // Cast
    (mockJobQueue.add as vi.Mock).mockResolvedValue(ok(undefined as void)); // Should not be called, use void

    const result = await useCase.execute(baseValidInput);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(DomainError);
      expect(result.value.message).toContain('Failed to save job');
    }
    expect(mockJobQueue.add).not.toHaveBeenCalled();
  });

  it('should return DomainError if jobQueue.add fails after successful save', async () => {
    (mockJobRepository.save as vi.Mock).mockResolvedValue(ok(undefined as void)); // Use void
    (mockJobQueue.add as vi.Mock).mockResolvedValue(error(new DomainError('Queue add failed') as Error)); // Cast

    const result = await useCase.execute(baseValidInput);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(DomainError);
      expect(result.value.message).toContain('Failed to enqueue job after saving');
    }
    expect(mockJobRepository.save).toHaveBeenCalledTimes(1);
  });
});
