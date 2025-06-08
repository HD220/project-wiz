import { Job } from "./job.entity";
import { JobId } from "./value-objects/job-id.vo";
import { JobStatus } from "./value-objects/job-status.vo";
import { RetryPolicy, BackoffType } from "./value-objects/retry-policy.vo";

describe("Job Entity", () => {
  const baseJobProps = {
    id: new JobId("job-123"),
    name: "Test Job",
    status: JobStatus.pending(),
    attempts: 0,
    createdAt: new Date(),
  };

  describe("WAITING state transitions", () => {
    it("should transition to WAITING state", () => {
      const job = new Job(baseJobProps);
      const waitingJob = job.wait();

      expect(waitingJob.status.value).toBe("WAITING");
      expect(waitingJob.updatedAt).toBeDefined();
    });

    it("should maintain other properties when transitioning to WAITING", () => {
      const job = new Job(baseJobProps);
      const waitingJob = job.wait();

      expect(waitingJob.id.value).toBe(baseJobProps.id.value);
      expect(waitingJob.name).toBe(baseJobProps.name);
      expect(waitingJob.attempts).toBe(baseJobProps.attempts);
    });
  });

  describe("DELAYED state transitions", () => {
    it("should transition to DELAYED state", () => {
      const job = new Job(baseJobProps);
      const delayedJob = job.delay();

      expect(delayedJob.status.value).toBe("DELAYED");
      expect(delayedJob.updatedAt).toBeDefined();
    });

    it("should maintain other properties when transitioning to DELAYED", () => {
      const job = new Job(baseJobProps);
      const delayedJob = job.delay();

      expect(delayedJob.id.value).toBe(baseJobProps.id.value);
      expect(delayedJob.name).toBe(baseJobProps.name);
      expect(delayedJob.attempts).toBe(baseJobProps.attempts);
    });

    it("should increment attempts when using withAttempt", () => {
      const job = new Job(baseJobProps);
      const jobWithAttempt = job.withAttempt(1);

      expect(jobWithAttempt.attempts).toBe(1);
      expect(jobWithAttempt.updatedAt).toBeDefined();
    });
  });

  describe("Backoff Delay Calculation", () => {
    it("should return 0 when no retry policy is defined", () => {
      const job = new Job(baseJobProps);
      expect(job.calculateBackoffDelay()).toBe(0);
    });

    it("should calculate exponential backoff correctly", () => {
      const job = new Job({
        ...baseJobProps,
        retryPolicy: new RetryPolicy({
          delayBetweenAttempts: 1000,
          backoffType: BackoffType.EXPONENTIAL,
        }),
        attempts: 1,
      });
      expect(job.calculateBackoffDelay()).toBe(4000); // (1+1)^2 * 1000 = 4000
    });

    it("should calculate linear backoff correctly", () => {
      const job = new Job({
        ...baseJobProps,
        retryPolicy: new RetryPolicy({
          delayBetweenAttempts: 1000,
          backoffType: BackoffType.LINEAR,
        }),
        attempts: 2,
      });
      expect(job.calculateBackoffDelay()).toBe(3000); // (2+1) * 1000 = 3000
    });

    it("should calculate fixed backoff correctly", () => {
      const job = new Job({
        ...baseJobProps,
        retryPolicy: new RetryPolicy({
          delayBetweenAttempts: 1000,
          backoffType: BackoffType.FIXED,
        }),
        attempts: 3,
      });
      expect(job.calculateBackoffDelay()).toBe(1000);
    });

    it("should respect maxDelay when provided", () => {
      const job = new Job({
        ...baseJobProps,
        retryPolicy: new RetryPolicy({
          delayBetweenAttempts: 1000,
          backoffType: BackoffType.EXPONENTIAL,
          maxDelay: 5000,
        }),
        attempts: 2,
      });
      expect(job.calculateBackoffDelay()).toBe(5000); // (2+1)^2 * 1000 = 9000 → capped at 5000
    });
  });
});
