import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProcessJobServiceImpl } from "../../process-job.service";
import { Job } from "../../../../core/domain/entities/job/job.entity";
import { JobId } from "../../../../core/domain/entities/job/value-objects/job-id.vo";
import { JobStatus } from "../../../../core/domain/entities/job/value-objects/job-status.vo";
import { Worker } from "../../../../core/domain/entities/worker/worker.entity";
import { WorkerId } from "../../../../core/domain/entities/worker/value-objects/worker-id.vo";
import { WorkerStatus } from "../../../../core/domain/entities/worker/value-objects/worker-status.vo";
import { RetryPolicy } from "../../../../core/domain/entities/job/value-objects/retry-policy.vo";
import { ok } from "../../../../shared/result";

type MockJobRepository = {
  findById: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  list: ReturnType<typeof vi.fn>;
};

type MockQueueService = {
  enqueue: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  dequeue: ReturnType<typeof vi.fn>;
  list: ReturnType<typeof vi.fn>;
};

describe("ProcessJobService - Delayed State", () => {
  let service: ProcessJobServiceImpl;
  const mockJobRepository: MockJobRepository = {
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
  };
  const mockQueueService: MockQueueService = {
    enqueue: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    dequeue: vi.fn(),
    list: vi.fn(),
  };

  beforeEach(() => {
    service = new ProcessJobServiceImpl(mockJobRepository, mockQueueService);
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
    });
  };

  const createWorker = (status: WorkerStatus) => {
    return new Worker({
      id: new WorkerId("550e8400-e29b-41d4-a716-446655440001"),
      name: "Test Worker",
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  it("should process delayed job immediately when worker is available", async () => {
    const job = createJob(JobStatus.delayed());
    const worker = createWorker(WorkerStatus.available());

    mockJobRepository.findById.mockResolvedValue(ok(job));
    mockQueueService.enqueue.mockResolvedValue(ok(undefined));

    const result = await service.process(job, worker);
    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value.status.value).toBe("PROCESSING");
    }
  });

  it("should not process delayed job when worker is busy", async () => {
    const job = createJob(JobStatus.delayed());
    const worker = createWorker(WorkerStatus.busy());

    mockJobRepository.findById.mockResolvedValue(ok(job));
    mockQueueService.enqueue.mockResolvedValue(ok(undefined));

    const result = await service.process(job, worker);
    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value.status.value).toBe("DELAYED");
    }
  });

  it("should update job status when processing delayed job", async () => {
    const job = createJob(JobStatus.delayed());
    const worker = createWorker(WorkerStatus.available());

    mockJobRepository.findById.mockResolvedValue(ok(job));
    mockQueueService.enqueue.mockResolvedValue(ok(undefined));

    const result = await service.process(job, worker);
    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value.status.value).toBe("PROCESSING");
    }
  });
});
