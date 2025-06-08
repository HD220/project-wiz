import { describe, it, expect, vi, beforeEach } from "vitest";
import { Job } from "@/core/domain/entities/job/job.entity";
import { JobBuilder } from "@/core/domain/entities/job/job-builder";
import { JobId } from "@/core/domain/entities/job/value-objects/job-id.vo";
import { JobStatus } from "@/core/domain/entities/job/value-objects/job-status.vo";
import { RetryPolicy } from "@/core/domain/entities/job/value-objects/retry-policy.vo";
import { JobRepositoryDrizzle } from "@/infrastructure/repositories/job-drizzle.repository";
import { ok } from "@/shared/result";
import { ElectronIpcService } from "@/infrastructure/frameworks/electron/electron-ipc.adapter";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

type JobDto = {
  id: string | number;
  name: string;
  status: string;
  attempts: number;
  retryPolicy?: {
    maxAttempts: number;
    delayBetweenAttempts: number;
    backoffType: string;
    maxDelay?: number;
  };
  createdAt: Date;
  updatedAt?: Date;
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

// Mock do IPCChannels
const mockIpcChannels = {
  QUERY_JOB_STATUS: "query:job-status",
};

vi.mock("@/core/application/ports/ipc-channels", () => ({
  IpcChannels: mockIpcChannels,
}));

const createMockJob = (_overrides: Partial<Job> = {}) => {
  const jobId = new JobId(crypto.randomUUID());
  return new JobBuilder()
    .withId(jobId)
    .withName("test-job")
    .withStatus(JobStatus.createInitial())
    .withRetryPolicy(new RetryPolicy({ maxAttempts: 3 }))
    .withCreatedAt(new Date())
    .build();
};

describe("Job Query Channels - job-status", () => {
  let mockJobRepository: JobRepositoryDrizzle;
  let ipcService: ElectronIpcService;
  let mockJob: Job;

  beforeEach(() => {
    mockJobRepository = new JobRepositoryDrizzle(
      {} as BetterSQLite3Database<Record<string, never>>
    );
    ipcService = new ElectronIpcService();
    mockJob = createMockJob();

    vi.mocked(mockJobRepository.findById).mockResolvedValue(ok(mockJob));
  });

  it("should return job when found", async () => {
    const testJobId = mockJob.id.value;
    const result = await ipcService.invoke<{ jobId: string }, JobDto | null>(
      mockIpcChannels.QUERY_JOB_STATUS,
      { jobId: testJobId }
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toEqual({
        id: mockJob.id.value,
        name: mockJob.name,
        status: mockJob.status.value,
        attempts: mockJob.attempts,
        retryPolicy: mockJob.retryPolicy
          ? {
              maxAttempts: mockJob.retryPolicy.value.maxAttempts,
              delayBetweenAttempts:
                mockJob.retryPolicy.value.delayBetweenAttempts,
              backoffType: mockJob.retryPolicy.value.backoffType,
              maxDelay: mockJob.retryPolicy.value.maxDelay,
            }
          : undefined,
        createdAt: mockJob.createdAt,
        updatedAt: mockJob.updatedAt,
        payload: mockJob.payload,
        metadata: mockJob.metadata,
      });
    }
    expect(mockJobRepository.findById).toHaveBeenCalledWith(
      new JobId(testJobId)
    );
  });

  it("should validate jobId parameter type", async () => {
    const result = await ipcService.invoke<{ jobId: string }, JobDto | null>(
      mockIpcChannels.QUERY_JOB_STATUS,
      { jobId: "123" } // string válida
    );

    expect(result.isOk()).toBe(true);
  });
});
