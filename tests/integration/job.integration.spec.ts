import { describe, it, expect, beforeEach } from "vitest";
import { Job } from "../../src/core/domain/entities/job/job.entity";
import { JobId } from "../../src/core/domain/entities/job/value-objects/job-id.vo";
import { JobStatus } from "../../src/core/domain/entities/job/value-objects/job-status.vo";
import { RetryPolicy } from "../../src/core/domain/entities/job/value-objects/retry-policy.vo";
import { RetryJobUseCase } from "../../src/core/application/use-cases/retry-job.usecase";
import { JobPriority } from "../../src/core/domain/entities/job/value-objects/job-priority.vo";
import { JobDependsOn } from "../../src/core/domain/entities/job/value-objects/job-depends-on.vo";
import { Ok, ok as resultOk } from "../../src/shared/result";
import { ActivityType } from "../../src/core/domain/entities/job/value-objects/activity-type.vo";
import { ActivityContext } from "../../src/core/domain/entities/job/value-objects/activity-context.vo";
import { ActivityHistoryEntry } from "../../src/core/domain/entities/job/value-objects/activity-history-entry.vo";
import { ActivityHistory } from "../../src/core/domain/entities/job/value-objects/activity-history.vo";

describe("Job Integration Tests", () => {
  describe("Retry Job Flow", () => {
    let jobRepository: {
      findById: jest.Mock;
      update: jest.Mock;
    };
    let workerPool: {
      enqueue: jest.Mock;
    };
    let retryJobUseCase: RetryJobUseCase;

    beforeEach(() => {
      jobRepository = {
        findById: jest.fn(),
        update: jest.fn(),
      };
      workerPool = {
        enqueue: jest.fn(),
      };
      retryJobUseCase = new RetryJobUseCase(jobRepository, workerPool);
    });

    it("should retry a failed job with exponential backoff", async () => {
      // Arrange
      const jobId = new JobId("job-123");
      const job = new Job({
        id: jobId,
        name: "test-job",
        status: JobStatus.create("FAILED"),
        attempts: 1,
        retryPolicy: new RetryPolicy({
          maxAttempts: 3,
          delayBetweenAttempts: 1000,
        }),
        createdAt: new Date(),
        priority: (JobPriority.create(0) as Ok<JobPriority>).value,
        dependsOn: new JobDependsOn([]),
        activityType: (
          ActivityType.create("TASK_EXECUTION") as Ok<ActivityType>
        ).value,
        context: ActivityContext.create({
          activityHistory: ActivityHistory.create([
            ActivityHistoryEntry.create("system", "Initial state", new Date()),
          ]),
        }),
      });

      jobRepository.findById.mockResolvedValue(job);
      jobRepository.update.mockImplementation((updatedJob) => {
        expect(updatedJob.status.value).toBe("RETRYING");
        expect(updatedJob.attempts).toBe(2);
        return Promise.resolve();
      });

      // Act
      const result = await retryJobUseCase.execute({ jobId });

      // Assert
      expect(result).toEqual({
        jobId,
        attempts: 2,
        nextAttemptAt: expect.any(Date),
      });

      // Verify exponential backoff
      const nextAttemptDelay = result.nextAttemptAt.getTime() - Date.now();
      expect(nextAttemptDelay).toBeGreaterThanOrEqual(2000); // 1000 * 2^1
      expect(nextAttemptDelay).toBeLessThan(3000);

      expect(workerPool.enqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          id: jobId,
          status: JobStatus.create("DELAYED"),
        })
      );
    });

    it("should fail when job has no retry policy", async () => {
      // Arrange
      const jobId = new JobId("job-456");
      const job = new Job({
        id: jobId,
        name: "test-job-no-retry",
        status: JobStatus.create("FAILED"),
        attempts: 1,
        retryPolicy: undefined,
        createdAt: new Date(),
        priority: (JobPriority.create(0) as Ok<JobPriority>).value,
        dependsOn: new JobDependsOn([]),
        activityType: (
          ActivityType.create("TASK_EXECUTION") as Ok<ActivityType>
        ).value,
        context: ActivityContext.create({
          activityHistory: ActivityHistory.create([
            ActivityHistoryEntry.create("system", "Initial state", new Date()),
          ]),
        }),
      });

      jobRepository.findById.mockResolvedValue(job);

      // Act & Assert
      await expect(retryJobUseCase.execute({ jobId })).rejects.toThrow(
        "Job has no retry policy"
      );
    });

    it("should fail when max retry attempts reached", async () => {
      // Arrange
      const jobId = new JobId("job-789");
      const job = new Job({
        id: jobId,
        name: "test-job-max-attempts",
        status: JobStatus.create("FAILED"),
        attempts: 3,
        retryPolicy: new RetryPolicy({
          maxAttempts: 3,
          delayBetweenAttempts: 1000,
        }),
        createdAt: new Date(),
        priority: (JobPriority.create(0) as Ok<JobPriority>).value,
        dependsOn: new JobDependsOn([]),
        activityType: (
          ActivityType.create("TASK_EXECUTION") as Ok<ActivityType>
        ).value,
        context: ActivityContext.create({
          activityHistory: ActivityHistory.create([
            ActivityHistoryEntry.create("system", "Initial state", new Date()),
          ]),
        }),
      });

      jobRepository.findById.mockResolvedValue(job);

      // Act & Assert
      await expect(retryJobUseCase.execute({ jobId })).rejects.toThrow(
        "Max retry attempts reached"
      );
    });
  });
});
