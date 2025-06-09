import { describe, it, expect, beforeEach } from "vitest";
import { CreateJobUseCase } from "../../src/core/application/use-cases/create-job.usecase";
import { Job } from "../../src/core/domain/entities/job/job.entity";
import { ActivityHistoryEntry } from "../../src/core/domain/entities/job/value-objects/activity-history-entry.vo";
import { ActivityHistory } from "../../src/core/domain/entities/job/value-objects/activity-history.vo";
import { ActivityType } from "../../src/core/domain/entities/job/value-objects/activity-type.vo";
import { ActivityContext } from "../../src/core/domain/entities/job/value-objects/activity-context.vo";
import { JobId } from "../../src/core/domain/entities/job/value-objects/job-id.vo";
import { JobStatus } from "../../src/core/domain/entities/job/value-objects/job-status.vo";
import { JobRepository } from "../../src/core/application/ports/job-repository.interface";
import { JobPriority } from "../../src/core/domain/entities/job/value-objects/job-priority.vo";
import { JobDependsOn } from "../../src/core/domain/entities/job/value-objects/job-depends-on.vo";
import { Ok, ok } from "../../src/shared/result";
import { JobQueue } from "../../src/core/application/ports/job-queue.interface";

describe("CreateJobUseCase Integration", () => {
  let jobRepository: jest.Mocked<JobRepository>;
  let jobQueue: jest.Mocked<JobQueue>;

  beforeEach(() => {
    jobRepository = {
      create: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue(ok(expect.any(Job))),
      delete: jest.fn().mockResolvedValue(ok(undefined)),
      list: jest.fn().mockResolvedValue(ok([])),
      findByIds: jest.fn().mockResolvedValue(ok([])),
      findDependentJobs: jest.fn().mockResolvedValue(ok([])),
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
        activityType: "ACTIVITY_GROUP",
        context: {
          activityHistory: [
            {
              timestamp: new Date(),
              role: "system",
              content: "Job created",
            },
          ],
        },
      };

      const result = await useCase.execute(input);

      expect(result.isOk()).toBe(true);
      expect(jobRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: input.name,
          payload: input.payload,
          activityType: expect.objectContaining({ value: input.activityType }),
        })
      );
      expect(jobQueue.addJob).toHaveBeenCalledWith(
        expect.objectContaining({
          name: input.name,
          payload: input.payload,
          activityType: expect.objectContaining({ value: input.activityType }),
        })
      );
    });

    it("should validate input schema", async () => {
      const useCase = new CreateJobUseCase(jobRepository, jobQueue);
      const invalidInput = {
        name: "", // Nome vazio inválido
        payload: { key: "value" },
        activityType: "ACTIVITY_GROUP",
        context: {
          activityHistory: [
            {
              timestamp: new Date(),
              role: "system",
              content: "Job created",
            },
          ],
        },
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
        activityType: "ACTIVITY_GROUP",
        context: {
          activityHistory: [
            {
              timestamp: new Date(),
              role: "system",
              content: "Job created",
            },
          ],
        },
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
        activityType: "ACTIVITY_GROUP",
        context: {
          activityHistory: [
            {
              timestamp: new Date(),
              role: "system",
              content: "Job created",
            },
          ],
        },
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
        priority: (JobPriority.create(0) as Ok<JobPriority>).value,
        dependsOn: new JobDependsOn([]),
        activityType: (
          ActivityType.create("ACTIVITY_GROUP") as Ok<ActivityType>
        ).value,
        context: ActivityContext.create({
          activityHistory: ActivityHistory.create([]),
        }),
        relatedActivityIds: [],
      });

      jobRepository.create.mockImplementation((_job: Job) => {
        jobQueue.addJob.mockImplementation(() => Promise.resolve());
        return Promise.resolve(ok(_job));
      });

      const useCase = new CreateJobUseCase(jobRepository, jobQueue);
      const _input = {
        name: "consistent-job",
        payload: { key: "value" },
        activityType: "ACTIVITY_GROUP",
        context: {
          activityHistory: [
            {
              timestamp: new Date(),
              role: "system",
              content: "Job created",
            },
          ],
        },
      };

      const result = await useCase.execute({
        name: "consistent-job",
        payload: { key: "value" },
        activityType: "ACTIVITY_GROUP",
        context: {
          activityHistory: [
            {
              timestamp: new Date(),
              role: "system",
              content: "Job created",
            },
          ],
        },
      });

      expect(result.isOk()).toBe(true);
      expect(jobRepository.create).toHaveBeenCalled();
      expect(jobQueue.addJob).toHaveBeenCalled();
    });
  });
});
