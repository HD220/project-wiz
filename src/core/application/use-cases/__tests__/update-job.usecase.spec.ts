import { UpdateJobUseCase } from "./update-job.usecase";
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo";
import { JobStatus } from "../../domain/entities/job/value-objects/job-status.vo";
import { ok, error, Result, Ok } from "../../../shared/result";
import { Job } from "../../domain/entities/job/job.entity";
import { JobBuilder } from "../../domain/entities/job/job-builder";
import { ActivityHistoryEntry } from "../../domain/entities/job/value-objects/activity-history-entry.vo";
import { ActivityHistory } from "../../domain/entities/job/value-objects/activity-history.vo";
import { ActivityType } from "../../domain/entities/job/value-objects/activity-type.vo";
import { ActivityContext } from "../../domain/entities/job/value-objects/activity-context.vo";

describe("UpdateJobUseCase", () => {
  let jobRepository: jest.Mocked<UpdateJobUseCase["jobRepository"]>;
  let jobQueue: jest.Mocked<UpdateJobUseCase["jobQueue"]>;
  let useCase: UpdateJobUseCase;

  const existingJob = new JobBuilder()
    .withId(new JobId("existing-job-id"))
    .withName("existing-job")
    .withStatus(JobStatus.create("FINISHED"))
    .withActivityType(
      (ActivityType.create("TASK_EXECUTION") as Ok<ActivityType>).value
    )
    .withContext(
      ActivityContext.create({
        activityHistory: ActivityHistory.create([
          ActivityHistoryEntry.create("user", "Initial task", new Date()),
        ]),
      })
    )
    .build();

  const validInput = {
    id: "existing-job-id",
    status: JobStatus.create("PENDING").value, // Corrigido para passar o valor da string
    retryPolicy: {
      maxRetries: 3,
      delay: 1000,
    },
    activityType: "CODE_GENERATION",
    context: {
      activityHistory: [
        {
          role: "assistant",
          content: "Generating code",
          timestamp: new Date(),
        },
      ],
    },
  };

  const invalidInput = {
    id: "", // ID vazio inválido
    status: JobStatus.create("PENDING").value, // Corrigido para passar o valor da string
    activityType: "CODE_GENERATION",
  };

  beforeEach(() => {
    jobRepository = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(ok(existingJob)),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      findByIds: jest.fn(),
      findDependentJobs: jest.fn(),
    };
    jobQueue = {
      addJob: jest.fn(),
      processJobs: jest.fn(),
      on: jest.fn(),
    };
    useCase = new UpdateJobUseCase(jobRepository, jobQueue);
  });

  describe("execute", () => {
    describe("when input is valid", () => {
      it("should update job successfully", async () => {
        const result = await useCase.execute(validInput);

        expect(result).toEqual(
          ok({
            id: validInput.id,
            name: existingJob.name,
            status: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            activityType: validInput.activityType,
            context: expect.objectContaining({
              activityHistory: expect.arrayContaining([
                expect.objectContaining({
                  role: "assistant",
                  content: "Generating code",
                }),
              ]),
            }),
          })
        );

        expect(jobRepository.update).toHaveBeenCalledTimes(1);
        expect(jobQueue.addJob).toHaveBeenCalledTimes(1);

        const updatedJob = jobRepository.update.mock.calls[0][0];
        expect(updatedJob).toBeInstanceOf(Job);
        expect(updatedJob.status.value).toBe("PENDING");
        expect(updatedJob.activityType?.value).toBe(validInput.activityType);
        expect(updatedJob.retryPolicy?.value.maxAttempts).toBe(3);
      });

      it("should update job without enqueue when status not changed to PENDING", async () => {
        const inputWithoutStatusChange = {
          ...validInput,
          status: undefined,
          retryPolicy: undefined,
        };

        const result = await useCase.execute(inputWithoutStatusChange);

        expect(result).toEqual(
          ok({
            id: validInput.id,
            name: existingJob.name,
            status: expect.any(String), // Should be existingJob.status.value as it's not changed
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            activityType: existingJob.activityType?.value, // Should be existingJob.activityType as it's not changed
            context: expect.objectContaining({
              // Should be existingJob.context
              activityHistory: expect.arrayContaining([
                expect.objectContaining({
                  role: "user",
                  content: "Initial task",
                }),
              ]),
            }),
          })
        );

        expect(jobRepository.update).toHaveBeenCalledTimes(1);
        expect(jobQueue.addJob).not.toHaveBeenCalled();
      });
    });

    describe("when input is invalid", () => {
      it("should return validation error", async () => {
        const result = await useCase.execute(invalidInput);

        expect(result).toEqual(
          error(expect.stringContaining("Validation failed"))
        );
        expect(jobRepository.update).not.toHaveBeenCalled();
        expect(jobQueue.addJob).not.toHaveBeenCalled();
      });
    });

    describe("when job not found", () => {
      it("should return not found error", async () => {
        jobRepository.findById.mockResolvedValue(error("Job not found"));
        const result = await useCase.execute(validInput);

        expect(result).toEqual(error("Job not found"));
        expect(jobRepository.update).not.toHaveBeenCalled();
        expect(jobQueue.addJob).not.toHaveBeenCalled();
      });
    });

    describe("when repository fails", () => {
      it("should return error", async () => {
        jobRepository.update.mockRejectedValue(new Error("Repository error"));

        const result = await useCase.execute(validInput);

        expect(result).toEqual(error("Repository error"));
        expect(jobQueue.addJob).not.toHaveBeenCalled();
      });
    });

    describe("when job queue fails", () => {
      it("should return error", async () => {
        jobQueue.addJob.mockRejectedValue(new Error("Queue error"));

        const result = await useCase.execute(validInput);

        expect(result).toEqual(error("Queue error"));
        expect(jobRepository.update).toHaveBeenCalled();
      });
    });
  });
});
