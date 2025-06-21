import { describe, it, expect } from "vitest";
import { WorkerStatus, WorkerStatusType } from "./worker-status.vo";

describe("WorkerStatus", () => {
  it("should create with valid status", () => {
    const status = new WorkerStatus("available");
    expect(status.value).toBe("available");
  });

  it("should throw with invalid status", () => {
    expect(
      () => new WorkerStatus("invalid" as unknown as WorkerStatusType)
    ).toThrow();
  });

  it("should create available status via static method", () => {
    const status = WorkerStatus.available();
    expect(status.value).toBe("available");
  });

  it("should create busy status via static method", () => {
    const status = WorkerStatus.busy();
    expect(status.value).toBe("busy");
  });

  it("should create offline status via static method", () => {
    const status = WorkerStatus.offline();
    expect(status.value).toBe("offline");
  });
});
