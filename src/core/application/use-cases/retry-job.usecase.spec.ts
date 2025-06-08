import { RetryJobUseCase } from "./retry-job.usecase";
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo";
import { Job } from "../../domain/entities/job/job.entity";
import { RetryPolicy } from "../../domain/entities/job/value-objects/retry-policy.vo";
import { JobStatus } from "../../domain/entities/job/value-objects/job-status.vo";

describe("RetryJobUseCase", () => {
  let jobRepository: jest.Mocked<RetryJobUseCase["jobRepository"]>;
  let workerPool: jest.Mocked<RetryJobUseCase["workerPool"]>;
  let useCase: RetryJobUseCase;

  beforeEach(() => {
    jobRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    workerPool = {
      enqueue: jest.fn(),
    };
    useCase = new RetryJobUseCase(jobRepository, workerPool);
  });

  describe("execute", () => {
    describe("when job exists and can be retried", () => {
      it("should retry the job successfully", async () => {
        const jobId = new JobId("job-1");
        const job = new Job({
          id: jobId,
          name: "test-job",
          attempts: 1,
          retryPolicy: new RetryPolicy({
            maxAttempts: 3,
            delayBetweenAttempts: 1000,
          }),
          status: new JobStatus("FAILED"),
          createdAt: new Date(),
        });

        jobRepository.findById.mockResolvedValue(job);
        jobRepository.update.mockResolvedValue();

        const result = await useCase.execute({ jobId });

        expect(jobRepository.findById).toHaveBeenCalledWith(jobId);
        expect(jobRepository.update).toHaveBeenCalled();
        expect(workerPool.enqueue).toHaveBeenCalled();
        expect(result).toEqual({
          jobId,
          attempts: 2,
          nextAttemptAt: expect.any(Date),
        });
      });

      it("should calculate exponential backoff correctly", async () => {
        const jobId = new JobId("job-1");
        const job = new Job({
          id: jobId,
          name: "test-job",
          attempts: 2,
          retryPolicy: new RetryPolicy({
            maxAttempts: 3,
            delayBetweenAttempts: 1000,
          }),
          status: new JobStatus("FAILED"),
          createdAt: new Date(),
        });

        jobRepository.findById.mockResolvedValue(job);
        const result = await useCase.execute({ jobId });

        // 1000 * 2^2 = 4000
        const expectedDelay = 4000;
        const actualDelay = result.nextAttemptAt.getTime() - Date.now();
        expect(actualDelay).toBeCloseTo(expectedDelay, -2); // +/- 100ms
      });
    });

    describe("when job cannot be retried", () => {
      it("should throw when job not found", async () => {
        const jobId = new JobId("job-1");
        jobRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute({ jobId })).rejects.toThrow(
          "Job not found"
        );
      });

      it("should throw when job has no retry policy", async () => {
        const jobId = new JobId("job-1");
        const job = new Job({
          id: jobId,
          name: "test-job",
          attempts: 1,
          retryPolicy: undefined,
          status: new JobStatus("FAILED"),
          createdAt: new Date(),
        });

        jobRepository.findById.mockResolvedValue(job);

        await expect(useCase.execute({ jobId })).rejects.toThrow(
          "Job has no retry policy"
        );
      });

      it("should throw when max attempts reached", async () => {
        const jobId = new JobId("job-1");
        const job = new Job({
          id: jobId,
          name: "test-job",
          attempts: 3,
          retryPolicy: new RetryPolicy({
            maxAttempts: 3,
            delayBetweenAttempts: 1000,
          }),
          status: new JobStatus("FAILED"),
          createdAt: new Date(),
        });

        jobRepository.findById.mockResolvedValue(job);

        await expect(useCase.execute({ jobId })).rejects.toThrow(
          "Max retry attempts reached"
        );
      });
    });
  });
});
