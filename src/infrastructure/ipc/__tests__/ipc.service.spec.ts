import { describe, it, expect, vi, beforeEach } from "vitest";
import { IpcService } from "../ipc.service";
import { OK, NOK, Result } from "../../../shared/result";
import { JsonLogger } from "../../../services/logger/json-logger.service";

describe("IpcService", () => {
  const mockIpcRenderer = {
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  };

  let service: IpcService;
  let logger: JsonLogger;

  beforeEach(() => {
    vi.resetAllMocks();
    logger = new JsonLogger("test");
    service = new IpcService(mockIpcRenderer as any, logger);
  });

  describe("invokeHandler", () => {
    it("should return success with data when invocation succeeds", async () => {
      const testData = { id: "test" };
      mockIpcRenderer.invoke.mockResolvedValue(testData);

      const result = await service.invokeHandler("query:agent:get", {
        id: "test",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(testData);
      }
    });

    it("should return error when invocation fails", async () => {
      const testError = new Error("Test error");
      mockIpcRenderer.invoke.mockRejectedValue(testError);

      const result = await service.invokeHandler("query:agent:get", {
        id: "test",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toEqual(testError.message);
      }
    });

    it("should pass correct payload for agent execution", async () => {
      const testPayload = { agentId: "agent1", task: "test task" };
      mockIpcRenderer.invoke.mockResolvedValue({});

      await service.invokeHandler("command:agent:execute", testPayload);

      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
        "command:agent:execute",
        testPayload
      );
    });

    describe("retry policy", () => {
      it("should retry on network errors with exponential backoff", async () => {
        const networkError = new Error("ECONNREFUSED");
        mockIpcRenderer.invoke
          .mockRejectedValueOnce(networkError)
          .mockRejectedValueOnce(networkError)
          .mockResolvedValue({ success: true });

        const startTime = Date.now();
        await service.invokeHandler(
          "query:agent:get",
          { id: "test" },
          { retryPolicy: { maxRetries: 2, delay: 100 } }
        );
        const duration = Date.now() - startTime;

        expect(duration).toBeGreaterThanOrEqual(100 + 200);
        expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(3);
      });

      it("should not retry on business errors", async () => {
        const businessError = new Error("Invalid business logic");
        mockIpcRenderer.invoke.mockRejectedValue(businessError);

        const result = await service.invokeHandler(
          "query:agent:get",
          { id: "test" },
          {
            retryPolicy: { maxRetries: 3, delay: 100 },
          }
        );

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toBe(businessError.message);
        }
        expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(1);
      });

      it("should respect timeout", async () => {
        mockIpcRenderer.invoke.mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 200))
        );

        const startTime = Date.now();
        const result = await service.invokeHandler(
          "query:agent:get",
          { id: "test" },
          {
            timeout: 100,
            retryPolicy: { maxRetries: 0, delay: 0 },
          }
        );

        const duration = Date.now() - startTime;
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toMatch(/Timeout after 100ms/);
        }
        expect(duration).toBeGreaterThanOrEqual(100);
        expect(duration).toBeLessThan(150);
      }, 500);

      it("should log retry attempts", async () => {
        const networkError = new Error("ETIMEDOUT");
        mockIpcRenderer.invoke
          .mockRejectedValueOnce(networkError)
          .mockResolvedValue({});

        const logSpy = vi.spyOn(logger, "debug");

        await service.invokeHandler(
          "query:agent:get",
          { id: "test" },
          { retryPolicy: { maxRetries: 1, delay: 100 } }
        );

        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining("Retry attempt 1/1"),
          expect.objectContaining({
            delay: 100,
            error: "ETIMEDOUT",
          })
        );
      });
    });
  });

  describe("date serialization", () => {
    it("should correctly serialize and deserialize dates in query responses", async () => {
      const testDate = new Date("2025-01-01T12:00:00.123Z");
      const mockResponse = {
        data: {
          id: "test",
          date: testDate.toISOString(),
          nested: {
            dates: [testDate.toISOString()]
          }
        }
      };
      
      mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

      const result = await service.invokeHandler("query:agent:get", {
        id: "test"
      });

      expect(result.success).toBe(true);
      if (result.success) {
        const data = result.data as {
          id: string;
          date: Date;
          nested: { dates: Date[] };
        };
        expect(data.date).toBeInstanceOf(Date);
        expect(data.date.getTime()).toBe(testDate.getTime());
        expect(data.nested.dates[0]).toBeInstanceOf(Date);
        expect(data.nested.dates[0].getTime()).toBe(testDate.getTime());
      }
    });

    it("should handle null dates in responses", async () => {
      const mockResponse = {
        data: {
          id: "test",
          date: null,
          nested: { dates: [null] }
        }
      };
      
      mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

      const result = await service.invokeHandler("query:agent:get", {
        id: "test"
      });

      expect(result.success).toBe(true);
      if (result.success) {
        const data = result.data as {
          id: string;
          date: null;
          nested: { dates: [null] };
        };
        expect(data.date).toBeNull();
        expect(data.nested.dates[0]).toBeNull();
      }
    });
  });

  // ... (restante dos testes permanece igual)
});
