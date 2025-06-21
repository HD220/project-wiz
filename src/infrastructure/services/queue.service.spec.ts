import { QueueService } from "./queue.service";
import { Job } from "../../core/domain/entities/job/job.entity";
import { JobId } from "../../core/domain/entities/job/value-objects/job-id.vo";
import { JobStatus } from "../../core/domain/entities/job/value-objects/job-status.vo";
import {
  BackoffType,
  RetryPolicy,
} from "../../core/domain/entities/job/value-objects/retry-policy.vo";
import { Worker } from "../../core/domain/entities/worker/worker.entity";
import { WorkerId } from "../../core/domain/entities/worker/value-objects/worker-id.vo";
import { WorkerStatus } from "../../core/domain/entities/worker/value-objects/worker-status.vo";
import { ok, error, Ok } from "../../shared/result";
import { JobPriority } from "../../core/domain/entities/job/value-objects/job-priority.vo";
import { JobDependsOn } from "../../core/domain/entities/job/value-objects/job-depends-on.vo";
import { JobRepository } from "../../core/application/ports/job-repository.interface";
import { ProcessJobService } from "../../core/application/ports/process-job-service.interface";

describe("QueueService", () => {
  let queueService: QueueService;
  let mockJobRepository: jest.Mocked<JobRepository>;
  let mockProcessJobService: jest.Mocked<ProcessJobService>;
  const worker = new Worker({
    id: new WorkerId("worker-1"),
    name: "Test Worker",
    status: WorkerStatus.available(),
    createdAt: new Date(),
  });

  beforeEach(() => {
    mockJobRepository = {
      create: jest.fn().mockResolvedValue(ok({})),
      list: jest.fn().mockResolvedValue(ok([])),
      update: jest.fn().mockResolvedValue(ok({})),
      findById: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<JobRepository>;

    mockProcessJobService = {
      process: jest.fn().mockResolvedValue(ok({})),
    } as unknown as jest.Mocked<ProcessJobService>;

    queueService = new QueueService(
      mockJobRepository,
      mockProcessJobService,
      worker
    );
  });

  describe("addJob", () => {
    it("should add a job to the repository", async () => {
      const job = new Job({
        id: new JobId("job-1"),
        name: "test-job",
        status: JobStatus.create("WAITING"),
        attempts: 0,
        priority: (JobPriority.create(0) as Ok<JobPriority>).value,
        dependsOn: new JobDependsOn([]),
        createdAt: new Date(),
      });

      await queueService.addJob(job);

      expect(mockJobRepository.create).toHaveBeenCalledWith(job);
    });

    it("should throw error when repository fails", async () => {
      const job = new Job({
        id: new JobId("job-1"),
        name: "test-job",
        status: JobStatus.create("WAITING"),
        attempts: 0,
        priority: (JobPriority.create(0) as Ok<JobPriority>).value,
        dependsOn: new JobDependsOn([]),
        createdAt: new Date(),
      });

      mockJobRepository.create.mockResolvedValue(error("Database error"));

      await expect(queueService.addJob(job)).rejects.toThrow(
        "Failed to add job: Database error"
      );
    });
  });

  describe("processJobs", () => {
    it("should process waiting jobs", async () => {
      const job = new Job({
        id: new JobId("job-1"),
        name: "test-job",
        status: JobStatus.create("WAITING"),
        attempts: 0,
        priority: (JobPriority.create(0) as Ok<JobPriority>).value,
        dependsOn: new JobDependsOn([]),
        createdAt: new Date(),
      });

      mockJobRepository.list.mockResolvedValue(ok([job]));

      await queueService.processJobs();

      expect(mockProcessJobService.process).toHaveBeenCalledWith(job, worker);
    });

    it("should process delayed jobs", async () => {
      const job = new Job({
        id: new JobId("job-1"),
        name: "test-job",
        status: JobStatus.create("DELAYED"),
        attempts: 0,
        priority: (JobPriority.create(0) as Ok<JobPriority>).value,
        dependsOn: new JobDependsOn([]),
        createdAt: new Date(),
      });

      mockJobRepository.list.mockResolvedValue(ok([job]));

      await queueService.processJobs();

      expect(mockProcessJobService.process).toHaveBeenCalledWith(job, worker);
    });

    it("should not process completed jobs", async () => {
      const job = new Job({
        id: new JobId("job-1"),
        name: "test-job",
        status: JobStatus.create("FINISHED"),
        attempts: 0,
        priority: (JobPriority.create(0) as Ok<JobPriority>).value,
        dependsOn: new JobDependsOn([]),
        createdAt: new Date(),
      });

      mockJobRepository.list.mockResolvedValue(ok([job]));

      await queueService.processJobs();

      expect(mockProcessJobService.process).not.toHaveBeenCalled();
    });

    it("should handle job processing failure", async () => {
      const job = new Job({
        id: new JobId("job-1"),
        name: "test-job",
        status: JobStatus.create("WAITING"),
        attempts: 0,
        priority: (JobPriority.create(0) as Ok<JobPriority>).value,
        dependsOn: new JobDependsOn([]),
        createdAt: new Date(),
        retryPolicy: new RetryPolicy({
          maxAttempts: 3,
          backoffType: BackoffType.EXPONENTIAL,
          delayBetweenAttempts: 1000,
        }),
      });

      mockJobRepository.list.mockResolvedValue(ok([job]));
      mockProcessJobService.process.mockResolvedValue(
        error("Processing failed")
      );

      await queueService.processJobs();

      expect(mockJobRepository.update).toHaveBeenCalled();
      expect(job.status.value).toBe("DELAYED");
    });
  });

  describe("on", () => {
    it("should register event listeners", () => {
      const callback = jest.fn();
      queueService.on("completed", callback);

      expect(queueService["eventListeners"].completed).toContain(callback);
    });

    it("should emit events when job completes", async () => {
      const job = new Job({
        id: new JobId("job-1"),
        name: "test-job",
        status: JobStatus.create("WAITING"),
        attempts: 0,
        priority: (JobPriority.create(0) as Ok<JobPriority>).value,
        dependsOn: new JobDependsOn([]),
        createdAt: new Date(),
      });

      const callback = jest.fn();
      queueService.on("completed", callback);

      mockJobRepository.list.mockResolvedValue(ok([job]));
      mockProcessJobService.process.mockResolvedValue(ok(job.complete()));

      await queueService.processJobs();

      expect(callback).toHaveBeenCalledWith(job.id);
    });
  });
});
