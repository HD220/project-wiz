import { describe, beforeEach, it, expect, vi } from "vitest";
import { ProcessJobUseCase } from "./process-job.usecase";
import { Job } from "../../domain/entities/job/job.entity";
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo";
import { JobStatus } from "../../domain/entities/job/value-objects/job-status.vo";
import { ok, error, Ok } from "../../../shared/result";
import { JobPriority } from "../../domain/entities/job/value-objects/job-priority.vo";
import { JobDependsOn } from "../../domain/entities/job/value-objects/job-depends-on.vo";
import { JobRepository } from "../ports/job-repository.interface";
import { ProcessJobService } from "../ports/process-job-service.interface";
import { WorkerAssignmentService } from "../ports/worker-assignment-service.interface";
// Removido import de Worker

// Mock implementations with proper typing
const mockJobRepository: JobRepository = {
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
  findByIds: vi.fn(),
  findDependentJobs: vi.fn(),
};

const mockWorkerAssignmentService: WorkerAssignmentService = {
  assignWorker: vi.fn(),
};

const mockProcessJobService: ProcessJobService = {
  process: vi.fn(),
  executeJob: vi.fn(),
};

describe("ProcessJobUseCase", () => {
  let useCase: ProcessJobUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ProcessJobUseCase(
      mockJobRepository,
      mockProcessJobService, // Corrigido: trocada a ordem destes parâmetros
      mockWorkerAssignmentService
    );
  });

  const createJob = (status: JobStatus) => {
    return new Job({
      id: new JobId("job-123"),
      name: "Test Job",
      status,
      attempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: (JobPriority.create(0) as Ok<JobPriority>).value,
      dependsOn: new JobDependsOn([]),
    });
  };

  it("should successfully process a job", async () => {
    const jobId = new JobId("job-123");
    const workerId = "worker-123";
    const job = createJob(JobStatus.create("EXECUTING")); // Corrigido para JobStatus.create("EXECUTING")

    vi.mocked(mockJobRepository.findById).mockResolvedValue(ok(job));
    vi.mocked(mockProcessJobService.process).mockResolvedValue(ok(job));

    const result = await useCase.execute({ jobId, workerId });
    expect(result.isOk()).toBe(true);
    expect(mockJobRepository.findById).toHaveBeenCalledWith(jobId);
    expect(mockProcessJobService.process).toHaveBeenCalled();
  });

  it("should return error when job not found", async () => {
    const jobId = new JobId("job-123");
    const workerId = "worker-123";

    vi.mocked(mockJobRepository.findById).mockResolvedValue(
      error("Job not found")
    );

    const result = await useCase.execute({ jobId, workerId });
    expect(result.isError()).toBe(true);
    expect(result).toEqual(error("Job not found"));
  });

  it("should handle processing failure", async () => {
    const jobId = new JobId("job-123");
    const workerId = "worker-123";
    const job = createJob(JobStatus.create("EXECUTING")); // Corrigido para JobStatus.create("EXECUTING")

    vi.mocked(mockJobRepository.findById).mockResolvedValue(ok(job));
    vi.mocked(mockProcessJobService.process).mockResolvedValue(
      error("Processing failed")
    );

    const result = await useCase.execute({ jobId, workerId });
    expect(result.isError()).toBe(true);
    expect(result).toEqual(error("Processing failed"));
  });
});
