import { SqliteFQueue } from "../src/infrastructure/services/queue/sqlite-fqueue.service";
import { BasicAgent } from "../src/core/domain/entities/agent/basic-agent";
import { Worker } from "../src/core/domain/entities/agent/worker";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Agent System", () => {
  let queue: SqliteFQueue;
  let agent: BasicAgent;
  let worker: Worker;

  beforeAll(async () => {
    queue = new SqliteFQueue(":memory:");
    agent = new BasicAgent();
    worker = new Worker(queue, agent, "test-agent");
  });

  afterAll(async () => {
    // Cleanup
  });

  it("should process a job successfully", async () => {
    const job = await queue.addJob({
      name: "test-job",
      payload: { test: "data" },
      data: null,
      result: null,
      max_attempts: 3,
      priority: 1,
      delay: 0,
      max_retry_delay: 1000,
      retry_delay: 100,
      depends_on: [],
      created_at: new Date(),
      updated_at: new Date(),
    });

    await worker.start();

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedJob = await queue.getJob(job.id);
    expect(updatedJob?.status).toBe("success");
  });
});
