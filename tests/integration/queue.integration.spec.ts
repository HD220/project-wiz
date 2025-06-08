import { describe, it, expect, beforeEach } from "vitest";
import { Job } from "../../src/core/domain/entities/job/job.entity";
import { JobId } from "../../src/core/domain/entities/job/value-objects/job-id.vo";
import { JobStatus } from "../../src/core/domain/entities/job/value-objects/job-status.vo";
import { RetryPolicy } from "../../src/core/domain/entities/job/value-objects/retry-policy.vo";
import { RetryJobUseCase } from "../../src/core/application/use-cases/retry-job.usecase";

describe("Queue Integration Tests", () => {
  describe("Retry Job Flow", () => {
    let jobRepository: {
      findById: jest.Mock;
      update: jest.Mock;
    };
    let workerPool: {
      enqueue: jest.Mock;
    };
    let retryJobUseCase: RetryJobUseCase;
    let testJob: Job;

    beforeEach(() => {
      jobRepository = {
        findById: jest.fn(),
        update: jest.fn(),
      };
      workerPool = {
        enqueue: jest.fn(),
      };
      retryJobUseCase = new RetryJobUseCase(jobRepository, workerPool);

      testJob = new Job({
        id: new JobId("job-1"),
        name: "test-job",
        status: new JobStatus("FAILED"),
        attempts: 1,
        retryPolicy: new RetryPolicy({
          maxAttempts: 3,
          delayBetweenAttempts: 1000,
        }),
        createdAt: new Date(),
      });
    });

    it("should retry a failed job with exponential backoff", async () => {
      // Arrange
      jobRepository.findById.mockResolvedValue(testJob);
      jobRepository.update.mockImplementation((updatedJob) => {
        expect(updatedJob.status.value).toBe("RETRYING");
        expect(updatedJob.attempts).toBe(2);
        return Promise.resolve();
      });

      // Act
      const result = await retryJobUseCase.execute({ jobId: testJob.id });

      // Assert
      expect(result).toEqual({
        jobId: testJob.id,
        attempts: 2,
        nextAttemptAt: expect.any(Date),
      });

      // Verify exponential backoff
      const nextAttemptDelay = result.nextAttemptAt.getTime() - Date.now();
      expect(nextAttemptDelay).toBeGreaterThanOrEqual(2000); // 1000 * 2^1
      expect(nextAttemptDelay).toBeLessThan(3000);

      expect(workerPool.enqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          id: testJob.id,
          status: new JobStatus("RETRYING"),
        })
      );
    });

    it("should fail when job has no retry policy", async () => {
      // Arrange
      const jobWithoutPolicy = new Job({
        id: new JobId("job-no-policy"),
        name: "test-job-no-retry",
        status: new JobStatus("FAILED"),
        attempts: 1,
        retryPolicy: undefined,
        createdAt: new Date(),
      });

      jobRepository.findById.mockResolvedValue(jobWithoutPolicy);

      // Act & Assert
      await expect(
        retryJobUseCase.execute({ jobId: jobWithoutPolicy.id })
      ).rejects.toThrow("Job has no retry policy");
    });

    it("should fail when max retry attempts reached", async () => {
      // Arrange
      const maxAttemptJob = new Job({
        id: new JobId("job-max"),
        name: "max-attempt-job",
        status: new JobStatus("FAILED"),
        attempts: 3,
        retryPolicy: new RetryPolicy({
          maxAttempts: 3,
          delayBetweenAttempts: 1000,
        }),
        createdAt: new Date(),
      });

      jobRepository.findById.mockResolvedValue(maxAttemptJob);

      // Act & Assert
      await expect(
        retryJobUseCase.execute({ jobId: maxAttemptJob.id })
      ).rejects.toThrow("Max retry attempts reached");
    });
  });
});
