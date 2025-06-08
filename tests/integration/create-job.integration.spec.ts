import { describe, it, expect, beforeEach } from "vitest";
import { CreateJobUseCase } from "../../src/core/application/use-cases/create-job.usecase";
import { Job } from "../../src/core/domain/entities/job/job.entity";
import { JobId } from "../../src/core/domain/entities/job/value-objects/job-id.vo";
import { JobStatus } from "../../src/core/domain/entities/job/value-objects/job-status.vo";
import { JobRepository } from "../../src/core/application/ports/job-repository.interface";
import { JobQueue } from "../../src/core/application/ports/job-queue.interface";

describe("CreateJobUseCase Integration", () => {
  let jobRepository: jest.Mocked<JobRepository>;
  let jobQueue: jest.Mocked<JobQueue>;

  beforeEach(() => {
    jobRepository = {
      create: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(null),
      updateStatus: jest.fn().mockResolvedValue(undefined),
      incrementAttempt: jest.fn().mockResolvedValue(undefined),
      listPending: jest.fn().mockResolvedValue([]),
      listFailed: jest.fn().mockResolvedValue([]),
    };

    jobQueue = {
      addJob: jest.fn().mockResolvedValue(undefined),
      processJobs: jest.fn(),
      on: jest.fn(),
    } as jest.Mocked<JobQueue>;
  });

  describe("when creating a job", () => {
    it("should persist and enqueue successfully", async () => {
      const useCase = new CreateJobUseCase(jobRepository, jobQueue);
      const input = {
        name: "test-job",
        payload: { key: "value" },
        retryPolicy: {
          maxRetries: 3,
          delay: 1000,
        },
      };

      const result = await useCase.execute(input);

      expect(result.isOk()).toBe(true);
      expect(jobRepository.create).toHaveBeenCalledWith(expect.any(Job));
      expect(jobQueue.addJob).toHaveBeenCalledWith(expect.any(Job));
    });

    it("should validate input schema", async () => {
      const useCase = new CreateJobUseCase(jobRepository, jobQueue);
      const invalidInput = {
        name: "", // Nome vazio inválido
        payload: { key: "value" },
      };

      const result = await useCase.execute(invalidInput);

      expect(result.isError()).toBe(true);
      expect(result.isError()).toBe(true);
      if (result.isError()) {
        expect(result.message).toBeDefined();
        expect(result.message).toContain("name");
      }
    });

    it("should rollback if repository fails", async () => {
      jobRepository.create.mockRejectedValue(new Error("DB Error"));
      const useCase = new CreateJobUseCase(jobRepository, jobQueue);
      const input = {
        name: "test-job",
        payload: { key: "value" },
      };

      const result = await useCase.execute(input);

      expect(result.isError()).toBe(true);
      expect(jobQueue.addJob).not.toHaveBeenCalled();
    });

    it("should rollback if queue fails", async () => {
      jobQueue.addJob.mockRejectedValue(new Error("Queue Error"));
      const useCase = new CreateJobUseCase(jobRepository, jobQueue);
      const input = {
        name: "test-job",
        payload: { key: "value" },
      };

      const result = await useCase.execute(input);

      expect(result.isError()).toBe(true);
      expect(jobRepository.create).toHaveBeenCalledTimes(1);
    });

    it("should maintain consistency between repo and queue", async () => {
      const _testJob = new Job({
        id: new JobId("test-id"),
        name: "test-job",
        status: JobStatus.create("PENDING"),
        attempts: 0,
        payload: {},
        createdAt: new Date(),
      });

      jobRepository.create.mockImplementation((_job: Job) => {
        jobQueue.addJob.mockImplementation(() => Promise.resolve());
        return Promise.resolve();
      });

      const useCase = new CreateJobUseCase(jobRepository, jobQueue);
      const _input = {
        name: "consistent-job",
        payload: { key: "value" },
      };

      const result = await useCase.execute({
        name: "consistent-job",
        payload: { key: "value" },
      });

      expect(result.isOk()).toBe(true);
      expect(jobRepository.create).toHaveBeenCalled();
      expect(jobQueue.addJob).toHaveBeenCalled();
    });
  });
});
