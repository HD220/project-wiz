import { describe, it, expect } from "vitest";
import { JobStatus } from "@/core/domain/entities/job/value-objects/job-status.vo";

describe("JobStatus Machine", () => {
  it("should create with initial PENDING status", () => {
    const status = JobStatus.createInitial();
    expect(status.value).toBe("PENDING");
  });

  it("should allow valid transitions", () => {
    const status = JobStatus.createInitial();

    // PENDING -> EXECUTING
    const executing = status.transitionTo("EXECUTING");
    expect(executing.value).toBe("EXECUTING");

    // EXECUTING -> FINISHED
    const finished = executing.transitionTo("FINISHED");
    expect(finished.value).toBe("FINISHED");

    // PENDING -> DELAYED
    const delayed = status.transitionTo("DELAYED");
    expect(delayed.value).toBe("DELAYED");

    // DELAYED -> PENDING
    const pendingAgain = delayed.transitionTo("PENDING");
    expect(pendingAgain.value).toBe("PENDING");

    // FAILED -> DELAYED
    const failed = JobStatus.createInitial()
      .transitionTo("EXECUTING")
      .transitionTo("FAILED");
    const retried = failed.transitionTo("DELAYED");
    expect(retried.value).toBe("DELAYED");
  });

  it("should throw for invalid transitions", () => {
    const status = JobStatus.createInitial();

    // PENDING -> FINISHED (invalid)
    expect(() => status.transitionTo("FINISHED")).toThrow();

    // PENDING -> FAILED (invalid)
    expect(() => status.transitionTo("FAILED")).toThrow();

    // FINISHED -> PENDING (invalid)
    const finished = status.transitionTo("EXECUTING").transitionTo("FINISHED");
    expect(() => finished.transitionTo("PENDING")).toThrow();
  });

  it("should correctly check transition possibilities", () => {
    const status = JobStatus.createInitial();
    expect(status.canTransitionTo("EXECUTING")).toBe(true);
    expect(status.canTransitionTo("DELAYED")).toBe(true);
    expect(status.canTransitionTo("FINISHED")).toBe(false);
  });
});
