import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProcessJobServiceImpl } from "../../process-job.service";
import { Job } from "../../../../core/domain/entities/job/job.entity";
import { JobId } from "../../../../core/domain/entities/job/value-objects/job-id.vo";
import { JobStatus } from "../../../../core/domain/entities/job/value-objects/job-status.vo";
import { Worker } from "../../../../core/domain/entities/worker/worker.entity";
import { WorkerId } from "../../../../core/domain/entities/worker/value-objects/worker-id.vo";
import { WorkerStatus } from "../../../../core/domain/entities/worker/value-objects/worker-status.vo";
import { RetryPolicy } from "../../../../core/domain/entities/job/value-objects/retry-policy.vo";
import { ok, error, Ok } from "../../../../shared/result";
import { JobPriority } from "../../../../core/domain/entities/job/value-objects/job-priority.vo";
import { JobDependsOn } from "../../../../core/domain/entities/job/value-objects/job-depends-on.vo";
import { IAgentService } from "../../../../core/application/ports/agent-service.interface";

type MockJobRepository = {
  findById: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  list: ReturnType<typeof vi.fn>;
  findByIds: ReturnType<typeof vi.fn>;
  findDependentJobs: ReturnType<typeof vi.fn>;
};

type MockQueueService = {
  enqueue: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  dequeue: ReturnType<typeof vi.fn>;
  list: ReturnType<typeof vi.fn>;
};

describe("ProcessJobService - Retry Logic", () => {
  let service: ProcessJobServiceImpl;
  const mockJobRepository: MockJobRepository = {
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    findByIds: vi.fn(),
    findDependentJobs: vi.fn(),
  };
  const mockQueueService: MockQueueService = {
    enqueue: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    dequeue: vi.fn(),
    list: vi.fn(),
  };

  beforeEach(() => {
    const mockAgentService: IAgentService = {
      executeTask: vi.fn().mockResolvedValue(ok(undefined)),
    };
    service = new ProcessJobServiceImpl(
      mockJobRepository,
      mockQueueService,
      mockAgentService
    );
    vi.clearAllMocks();
  });

  const createJob = (
    status: JobStatus,
    attempts = 0,
    retryPolicy?: RetryPolicy
  ) => {
    return new Job({
      id: new JobId("550e8400-e29b-41d4-a716-446655440000"),
      name: "Test Job",
      status,
      attempts,
      retryPolicy,
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: (JobPriority.create(0) as Ok<JobPriority>).value,
      dependsOn: new JobDependsOn([]),
    });
  };

  const createWorker = () => {
    return new Worker({
      id: new WorkerId("550e8400-e29b-41d4-a716-446655440001"),
      name: "Test Worker",
      status: WorkerStatus.available(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  it("should retry when job fails", async () => {
    const retryPolicy = new RetryPolicy({
      backoffType: "fixed",
      delayBetweenAttempts: 1000,
      maxAttempts: 3,
    });
    const job = createJob(JobStatus.create("EXECUTING"), 0, retryPolicy);
    const worker = createWorker();

    // Simulate job failure by returning error string from repository
    mockJobRepository.findById.mockResolvedValue(error("Job failed"));
    mockQueueService.enqueue.mockResolvedValue(ok(undefined));

    const result = await service.process(job, worker);
    expect(result.isError()).toBe(true);
    expect(result).toEqual(
      error(expect.stringContaining("Job falhou e será retentado"))
    );
  });

  it("should respect maxDelay when calculating backoff", async () => {
    const retryPolicy = new RetryPolicy({
      backoffType: "exponential",
      delayBetweenAttempts: 1000,
      maxAttempts: 10,
      maxDelay: 5000,
    });
    const job = createJob(JobStatus.create("EXECUTING"), 5, retryPolicy);
    const _worker = createWorker();

    mockJobRepository.findById.mockResolvedValue(ok(job));
    mockQueueService.enqueue.mockResolvedValue(ok(undefined));

    const delay = job.calculateBackoffDelay();
    expect(delay).toBeLessThanOrEqual(5000);
  });
});
