import { describe, it, expect } from "vitest";
import { Job } from "@/core/domain/entities/jobs/job.entity";
import {
  JobStatus,
  JobStatusValues,
} from "@/core/domain/entities/jobs/job-status";
import { Result } from "@/shared/result";

class TestJob extends Job {
  async execute(): Promise<Result<void>> {
    return { success: true, data: undefined };
  }
}

describe("Job Entity", () => {
  describe("Priority Validation", () => {
    it("should accept priority 0 as default value", () => {
      const job = new TestJob(
        "test-id",
        new JobStatus(JobStatusValues.WAITING)
      );
      expect(job.getPriority()).toBe(0);
    });

    it("should accept valid priority values (0-10)", () => {
      const job = new TestJob(
        "test-id",
        new JobStatus(JobStatusValues.WAITING),
        5
      );
      expect(job.getPriority()).toBe(5);
    });

    it("should reject negative priority values", () => {
      const job = new TestJob(
        "test-id",
        new JobStatus(JobStatusValues.WAITING)
      );
      const result = job.setPriority(-1);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("Priority cannot be negative");
      }
    });

    it("should reject priority values greater than 10", () => {
      const job = new TestJob(
        "test-id",
        new JobStatus(JobStatusValues.WAITING)
      );
      const result = job.setPriority(11);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("Priority cannot be greater than 10");
      }
    });

    it("should update priority when valid value is provided", () => {
      const job = new TestJob(
        "test-id",
        new JobStatus(JobStatusValues.WAITING)
      );
      const result = job.setPriority(3);
      expect(result.success).toBe(true);
      expect(job.getPriority()).toBe(3);
    });
  });
});
