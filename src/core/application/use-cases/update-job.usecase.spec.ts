import { UpdateJobUseCase } from "./update-job.usecase";
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo";
import { JobStatus } from "../../domain/entities/job/value-objects/job-status.vo";
import { ok, error } from "../../../shared/result";
import { Job } from "../../domain/entities/job/job.entity";
import { JobBuilder } from "../../domain/entities/job/job-builder"; // Corrigido o caminho do import

describe("UpdateJobUseCase", () => {
  let jobRepository: jest.Mocked<UpdateJobUseCase["jobRepository"]>;
  let jobQueue: jest.Mocked<UpdateJobUseCase["jobQueue"]>;
  let useCase: UpdateJobUseCase;

  const existingJob = new JobBuilder()
    .withId(new JobId("existing-job-id"))
    .withName("existing-job")
    .withStatus(JobStatus.create("FINISHED"))
    .build();

  const validInput = {
    id: "existing-job-id",
    status: JobStatus.create("PENDING").value, // Corrigido para passar o valor da string
    retryPolicy: {
      maxRetries: 3,
      delay: 1000,
    },
  };

  const invalidInput = {
    id: "", // ID vazio inválido
    status: JobStatus.create("PENDING").value, // Corrigido para passar o valor da string
  };

  beforeEach(() => {
    jobRepository = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(ok(existingJob)),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
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
          })
        );

        expect(jobRepository.update).toHaveBeenCalledTimes(1);
        expect(jobQueue.addJob).toHaveBeenCalledTimes(1);

        const updatedJob = jobRepository.update.mock.calls[0][0];
        expect(updatedJob).toBeInstanceOf(Job);
        expect(updatedJob.status.value).toBe("PENDING");
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
            status: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
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
