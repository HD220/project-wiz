import { describe, it, expect } from "vitest";
import { JobStatus, JobStatusType } from "./job-status.vo";

describe("JobStatus", () => {
  describe("constructor", () => {
    it("should create with valid status PENDING", () => {
      const status = new JobStatus("PENDING");
      expect(status.value).toBe("PENDING");
    });

    it("should create with valid status PROCESSING", () => {
      const status = new JobStatus("PROCESSING");
      expect(status.value).toBe("PROCESSING");
    });

    it("should create with valid status COMPLETED", () => {
      const status = new JobStatus("COMPLETED");
      expect(status.value).toBe("COMPLETED");
    });

    it("should create with valid status FAILED", () => {
      const status = new JobStatus("FAILED");
      expect(status.value).toBe("FAILED");
    });

    it("should create with valid status RETRYING", () => {
      const status = new JobStatus("RETRYING");
      expect(status.value).toBe("RETRYING");
    });

    it("should throw with invalid status", () => {
      // Forçando um status inválido para testar a validação
      expect(
        () => new JobStatus("INVALID" as unknown as JobStatusType)
      ).toThrow();
    });
  });

  describe("value", () => {
    it("should return the status value", () => {
      const status = new JobStatus("PENDING");
      expect(status.value).toBe("PENDING");
    });

    it("should be immutable", () => {
      const status = new JobStatus("PENDING");
      expect(() => {
        // @ts-expect-error Testing immutability
        status.value = "COMPLETED";
      }).toThrow();
    });
  });
});
