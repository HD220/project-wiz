import { WorkerService } from "../services/llm/WorkerService";

describe("WorkerService", () => {
  it("should create a WorkerService instance", () => {
    const workerService = new WorkerService();
    expect(workerService).toBeInstanceOf(WorkerService);
  });
});
