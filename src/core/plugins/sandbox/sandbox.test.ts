import { Sandbox } from "./sandbox.js";
import {
  describe,
  beforeEach,
  afterEach,
  it,
  expect,
  jest,
} from "@jest/globals";
import { Worker } from "worker_threads";

// Definindo tipos para o mock
type WorkerCallback = (message: unknown) => void;
type WorkerEventHandler = (event: string, callback: WorkerCallback) => void;

interface MockWorker {
  postMessage: jest.Mock;
  terminate: jest.Mock;
  on: jest.Mock<WorkerEventHandler>;
}

// Implementação tipada do mock
const createMockWorker = (): MockWorker => {
  const callbacks: Record<string, WorkerCallback> = {};

  return {
    postMessage: jest.fn(),
    terminate: jest.fn(),
    on: jest.fn((event: string, callback: WorkerCallback) => {
      callbacks[event] = callback;
    }),
  };
};

// Mock do módulo worker_threads com tipagem adequada
jest.mock("worker_threads", () => ({
  Worker: jest.fn(() => createMockWorker()),
}));

describe("Sandbox", () => {
  let sandbox: Sandbox;
  let mockWorker: MockWorker;

  beforeEach(() => {
    mockWorker = createMockWorker();
    (Worker as unknown as jest.Mock).mockImplementation(() => mockWorker);
    sandbox = new Sandbox();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should timeout after MAX_EXECUTION_TIME", async () => {
      const executePromise = sandbox.execute("testMethod", {});

      // Avança o tempo para simular timeout
      jest.advanceTimersByTime(5000);

      await expect(executePromise).rejects.toThrow(
        "Execution timed out after 5000ms"
      );
      expect(mockWorker.terminate).toHaveBeenCalled();
    });

    it("should clear timeout on successful execution", async () => {
      const testResult = "testResult";
      const messageHandler = mockWorker.on.mock.calls.find(
        (call) => call[0] === "message"
      )?.[1] as WorkerCallback;

      if (messageHandler) {
        messageHandler({ success: true, result: testResult });
      }

      const result = await sandbox.execute("testMethod", {});
      expect(result).toBe(testResult);
    });

    it("should clear timeout on error", async () => {
      const testError = "Test error";
      const messageHandler = mockWorker.on.mock.calls.find(
        (call) => call[0] === "message"
      )?.[1] as WorkerCallback;

      if (messageHandler) {
        messageHandler({ success: false, error: testError });
      }

      await expect(sandbox.execute("testMethod", {})).rejects.toThrow(
        testError
      );
    });
  });
});
