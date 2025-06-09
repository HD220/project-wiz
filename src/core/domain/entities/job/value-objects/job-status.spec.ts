import { describe, it, expect } from "vitest";
import { JobStatus, JobStatusType } from "./job-status.vo";

describe("JobStatus", () => {
  describe("constructor", () => {
    it("should create with valid status PENDING", () => {
      const status = JobStatus.create("PENDING");
      expect(status.value).toBe("PENDING");
    });

    it("should create with valid status EXECUTING", () => {
      const status = JobStatus.create("EXECUTING");
      expect(status.value).toBe("EXECUTING");
    });

    it("should create with valid status FINISHED", () => {
      const status = JobStatus.create("FINISHED");
      expect(status.value).toBe("FINISHED");
    });

    it("should create with valid status FAILED", () => {
      const status = JobStatus.create("FAILED");
      expect(status.value).toBe("FAILED");
    });

    it("should create with valid status DELAYED", () => {
      const status = JobStatus.create("DELAYED");
      expect(status.value).toBe("DELAYED");
    });

    it("should create with valid status WAITING", () => {
      const status = JobStatus.create("WAITING");
      expect(status.value).toBe("WAITING");
    });

    it("should create with valid status CANCELLED", () => {
      const status = JobStatus.create("CANCELLED");
      expect(status.value).toBe("CANCELLED");
    });

    it("should throw with invalid status", () => {
      // Forçando um status inválido para testar a validação
      expect(() =>
        JobStatus.create("INVALID" as unknown as JobStatusType)
      ).toThrow();
    });
  });

  describe("value", () => {
    it("should return the status value", () => {
      const status = JobStatus.create("PENDING");
      expect(status.value).toBe("PENDING");
    });

    it("should be immutable", () => {
      const status = JobStatus.create("PENDING");
      expect(() => {
        // @ts-expect-error Testing immutability
        status.value = "COMPLETED";
      }).toThrow();
    });
  });
});
