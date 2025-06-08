import { CreateJobUseCase } from "./create-job.usecase";
import { ok, error } from "../../../shared/result";
import { Job } from "../../domain/entities/job/job.entity";

describe("CreateJobUseCase", () => {
  let jobRepository: jest.Mocked<CreateJobUseCase["jobRepository"]>;
  let jobQueue: jest.Mocked<CreateJobUseCase["jobQueue"]>;
  let useCase: CreateJobUseCase;

  const validInput = {
    name: "test-job",
    payload: { key: "value" },
    retryPolicy: {
      maxRetries: 3,
      delay: 1000,
    },
  };

  const invalidInput = {
    name: "", // Nome vazio inválido
    payload: {}, // Payload vazio (tipo correto mas falha na validação)
  };

  beforeEach(() => {
    jobRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
    };
    jobQueue = {
      addJob: jest.fn(),
      processJobs: jest.fn(),
      on: jest.fn(),
    };
    useCase = new CreateJobUseCase(jobRepository, jobQueue);
  });

  describe("execute", () => {
    describe("when input is valid", () => {
      it("should create and enqueue job successfully", async () => {
        const result = await useCase.execute(validInput);

        expect(result).toEqual(
          ok({
            id: expect.any(String),
            name: validInput.name,
            status: "PENDING",
            createdAt: expect.any(Date),
          })
        );

        expect(jobRepository.create).toHaveBeenCalledTimes(1);
        expect(jobQueue.addJob).toHaveBeenCalledTimes(1);

        const savedJob = jobRepository.create.mock.calls[0][0];
        expect(savedJob).toBeInstanceOf(Job);
        expect(savedJob.name).toBe(validInput.name);
        expect(savedJob.status.value).toBe("PENDING");
      });

      it("should create job without retry policy when not provided", async () => {
        const inputWithoutRetry = { ...validInput, retryPolicy: undefined };
        const result = await useCase.execute(inputWithoutRetry);

        expect(result).toEqual(
          ok({
            id: expect.any(String),
            name: validInput.name,
            status: "PENDING",
            createdAt: expect.any(Date),
          })
        );

        const savedJob = jobRepository.create.mock.calls[0][0];
        expect(savedJob.retryPolicy).toBeUndefined();
      });
    });

    describe("when input is invalid", () => {
      it("should return validation error", async () => {
        const result = await useCase.execute(invalidInput);

        expect(result).toEqual(
          error(expect.stringContaining("Validation failed"))
        );
        expect(jobRepository.create).not.toHaveBeenCalled();
        expect(jobQueue.addJob).not.toHaveBeenCalled();
      });
    });

    describe("when repository fails", () => {
      it("should return error", async () => {
        jobRepository.create.mockRejectedValue(new Error("Repository error"));

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
        expect(jobRepository.create).toHaveBeenCalled();
      });
    });
  });
});
