import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { JsonLogger } from "../json-logger.service";
import { Job } from "@/core/domain/entities/jobs/job.entity";

describe("JsonLogger", () => {
  let logger: JsonLogger;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logger = new JsonLogger("TestService");
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it("should log info messages with JSON format", () => {
    logger.info("Test message", { key: "value" });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const logCall = consoleSpy.mock.calls[0][0] as string;
    const loggedMessage = JSON.parse(logCall);

    expect(loggedMessage).toMatchObject({
      level: "info",
      service: "TestService",
      message: "Test message",
      key: "value",
    });
    expect(loggedMessage.timestamp).toBeDefined();
  });

  it("should log error messages with JSON format", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("Error message", { error: new Error("Test error") });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const logCall = errorSpy.mock.calls[0][0] as string;
    const loggedMessage = JSON.parse(logCall);

    expect(loggedMessage.level).toBe("error");
    expect(loggedMessage.message).toBe("Error message");
    errorSpy.mockRestore();
  });

  it("should add job context to logs", () => {
    const job = {
      getId: () => "job-123",
      getStatus: () => ({ current: "active" }),
      getPriority: () => 1,
      getCreatedAt: () => new Date("2025-01-01"),
    } as unknown as Job;

    const jobLogger = logger.withJobContext(job);
    jobLogger.info("Job log");

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const logCall = consoleSpy.mock.calls[0][0] as string;
    const loggedMessage = JSON.parse(logCall);

    expect(loggedMessage).toMatchObject({
      jobId: "job-123",
      jobStatus: "active",
      jobPriority: 1,
    });
  });
});
