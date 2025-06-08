import "@types/jest";
import { CancelJobUseCase } from "./cancel-job.usecase";
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo";
import { JobStatus } from "../../domain/entities/job/value-objects/job-status.vo";
import { ok, error } from "../../../shared/result";
import { JobBuilder } from "../../domain/entities/job/job-builder";
import { Job } from "../../domain/entities/job/job.entity";
import { Result } from "../../../shared/result";

// Interface para o JobRepository mock
interface MockJobRepository {
  findById: jest.Mock<Promise<Result<Job>>>;
  update: jest.Mock<Promise<Result<Job>>>;
  create: jest.Mock<Promise<Result<Job>>>;
  delete: jest.Mock<Promise<Result<void>>>;
  list: jest.Mock<Promise<Result<Job[]>>>;
}

// Interface para o JobQueue mock com tipos exatos
interface MockJobQueue {
  addJob: jest.Mock<Promise<void>>;
  cancelJob: jest.Mock<Promise<void>>;
  getJobStatus: jest.Mock<Promise<string>>;
  processJobs: jest.Mock;
  on: jest.Mock;
}

describe("CancelJobUseCase", () => {
  const mockJobRepository: MockJobRepository = {
    findById: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    list: jest.fn(),
  };

  const mockJobQueue: MockJobQueue = {
    addJob: jest.fn(),
    cancelJob: jest.fn(),
    getJobStatus: jest.fn(),
    processJobs: jest.fn(),
    on: jest.fn(),
  };

  const pendingJob = new JobBuilder()
    .withId(new JobId("job-id"))
    .withStatus(JobStatus.create("PENDING"))
    .build();

  const cancelledJob = new JobBuilder()
    .withId(new JobId("job-id"))
    .withStatus(JobStatus.create("CANCELLED"))
    .build();

  const validInput = { id: new JobId("job-id") };
  const invalidInput = { id: new JobId("") };

  let useCase: CancelJobUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJobRepository.findById.mockResolvedValue(ok(pendingJob));
    mockJobRepository.update.mockResolvedValue(ok(pendingJob));
    useCase = new CancelJobUseCase(mockJobRepository, mockJobQueue);
  });

  it("should cancel job successfully when input is valid", async () => {
    const result = await useCase.execute(validInput);

    expect(result).toEqual(
      ok({
        id: validInput.id,
        status: expect.any(JobStatus),
        updatedAt: expect.any(Date),
      })
    );
    expect(mockJobRepository.update).toHaveBeenCalledTimes(1);
  });

  it("should return error when job is already cancelled", async () => {
    mockJobRepository.findById.mockResolvedValue(ok(cancelledJob));
    const result = await useCase.execute(validInput);

    expect(result).toEqual(error("Job cannot be cancelled in current status"));
  });

  it("should return validation error when input is invalid", async () => {
    const result = await useCase.execute(invalidInput);

    expect(result).toEqual(error(expect.stringContaining("Validation failed")));
  });

  it("should return error when repository fails", async () => {
    mockJobRepository.update.mockRejectedValue(new Error("Repository error"));
    const result = await useCase.execute(validInput);

    expect(result).toEqual(error("Repository error"));
  });
});
