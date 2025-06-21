import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BrowserWindow, ipcMain, ipcRenderer } from "electron";
import { IpcManager } from "../../../src/infrastructure/ipc/ipc.manager";
import { IpcService } from "../../../src/infrastructure/ipc/ipc.service";
import { Result, OK, NOK } from "../../../src/shared/result";
import { JsonLogger } from "../../../src/infrastructure/services/logger/json-logger.service";
import { listAgentsHandler } from "../../../src/infrastructure/ipc/handlers/agent.handlers";

// Mocks
vi.mock("electron", () => {
  const mockWindows = new Set();
  type EventListener = (event: unknown, message: any) => void;
  const eventListeners = new Map<string, Set<EventListener>>();

  // Criar mock tipado para ipcRenderer.invoke
  const mockInvoke = vi.fn(async (channel: string, payload: any) => {
    // Mock implementation for query:agent:list
    if (channel === "query:agent:list") {
      return OK([
        { id: "agent-1", name: "Agent 1", status: "idle" },
        { id: "agent-2", name: "Agent 2", status: "working" },
      ]);
    }

    // Mock implementation for query:agent:get
    if (channel === "query:agent:get") {
      const { shouldFail, errorMessage, ...validPayload } = payload || {};

      if (shouldFail) {
        return NOK(new Error(errorMessage || "Test error"));
      }
      return OK(validPayload);
    }

    return OK(undefined);
  });

  // Mock para ipcRenderer.on
  const mockOn = vi.fn((channel: string, listener: EventListener) => {
    if (!eventListeners.has(channel)) {
      eventListeners.set(channel, new Set());
    }
    eventListeners.get(channel)?.add(listener);
  });

  // Mock para ipcRenderer.removeListener
  const mockRemoveListener = vi.fn(
    (channel: string, listener: EventListener) => {
      eventListeners.get(channel)?.delete(listener);
    }
  );

  // Função para emitir eventos mockados
  const emitMockEvent = (channel: string, message: any) => {
    const listeners = eventListeners.get(channel);
    if (listeners) {
      listeners.forEach((listener) => listener({}, message));
    }
  };

  return {
    BrowserWindow: vi.fn(() => {
      const window = {
        webContents: {
          send: vi.fn(),
        },
        isDestroyed: vi.fn(() => false),
        destroy: vi.fn(() => {
          mockWindows.delete(window);
        }),
      };
      mockWindows.add(window);
      return window;
    }),
    ipcMain: {
      handle: vi.fn(),
      on: vi.fn(),
      emit: vi.fn(),
    },
    ipcRenderer: {
      invoke: mockInvoke,
      send: vi.fn(),
      on: mockOn,
      removeListener: mockRemoveListener,
      __emitMockEvent: emitMockEvent, // Expor função para testes
    },
  };
});

describe("IPC Integration Tests", () => {
  let ipcManager: IpcManager;
  let ipcService: IpcService;
  let mockWindow: BrowserWindow;
  let logger: JsonLogger;

  beforeEach(() => {
    logger = new JsonLogger("ipc-integration-test");
    mockWindow = new BrowserWindow();
    ipcManager = new IpcManager([mockWindow], logger);
    ipcService = new IpcService(ipcRenderer, logger);

    // Registrar handler de exemplo
    ipcManager.registerHandler(listAgentsHandler.channel, listAgentsHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Synchronous Communication (Queries)", () => {
    it("should successfully complete a query roundtrip", async () => {
      const result = await ipcService.invokeHandler(
        "query:agent:list",
        undefined
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([
          { id: "agent-1", name: "Agent 1", status: "idle" },
          { id: "agent-2", name: "Agent 2", status: "working" },
        ]);
      }
    });

    it("should handle query errors properly", async () => {
      const testError = new Error("Test error");
      const errorHandler = vi.fn().mockImplementation(async () => {
        return NOK(testError);
      });

      const channel = "query:agent:get";
      ipcManager.registerHandler(channel, errorHandler);

      const result = await ipcService.invokeHandler(channel, { id: "test" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.message).toBe(testError.message);
      }
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe("Asynchronous Communication (Commands)", () => {
    it("should send commands without waiting for response", async () => {
      const mockHandler = vi.fn().mockImplementation(async () => OK("done"));
      const channel = "command:agent:execute";
      ipcManager.registerHandler(channel, mockHandler);

      await ipcService.invokeHandler(channel, {
        agentId: "agent-1",
        task: "test task",
      });

      expect(mockHandler).toHaveBeenCalledWith({
        meta: expect.objectContaining({
          correlationId: expect.any(String),
        }),
        payload: {
          agentId: "agent-1",
          task: "test task",
        },
      });
    });
  });

  describe("Event System (Pub/Sub)", () => {
    it("should subscribe and receive events", async () => {
      const channel = "event:agent:updated";
      const testPayload = { id: "agent-1", status: "updated" };

      let receivedEvent: any;
      const unsubscribe = ipcService.subscribe(channel, (event) => {
        receivedEvent = event;
      });

      // Emitir evento mockado com estrutura IpcMessage
      const mockEvent = {
        type: "event",
        payload: testPayload,
        meta: {
          timestamp: Date.now(),
          correlationId: "test-correlation-id",
        },
      };
      (ipcRenderer as any).__emitMockEvent(channel, mockEvent);

      expect(receivedEvent).toBeDefined();
      expect(receivedEvent.payload).toEqual(testPayload);

      unsubscribe();
    });
  });

  describe("Data Serialization", () => {
    interface ComplexData {
      id: string;
      date: Date;
      nested: {
        array: number[];
      };
    }

    it("should handle complex object serialization", async () => {
      const testDate = new Date("2025-06-15T19:30:02.436Z");
      const complexData: ComplexData = {
        id: "test",
        date: testDate,
        nested: {
          array: [1, 2, 3],
        },
      };

      const handler = async (_: any, payload: ComplexData) => OK(payload);
      const channel = "query:agent:get";

      ipcManager.registerHandler(channel, handler);

      const result = await ipcService.invokeHandler(channel, complexData);

      expect(result.success).toBe(true);
      if (result.success) {
        const data = result.data as ComplexData;
        expect(data.date).toBeInstanceOf(Date);
        expect(data.date.getTime()).toBe(testDate.getTime());
        expect(data).toEqual({
          id: "test",
          date: testDate,
          nested: {
            array: [1, 2, 3],
          },
        });
      }
    });
  });

  describe("Error Handling", () => {
    it("should recover from IPC timeouts with retry", async () => {
      type TestPayload = { id: string } & {
        shouldFail?: boolean;
        errorMessage?: string;
      };

      const channel = "query:agent:get";
      const testPayload: TestPayload = {
        id: "test",
        shouldFail: true,
        errorMessage: "Timeout",
      };

      const result = await ipcService.invokeHandler(channel, testPayload, {
        retryPolicy: { maxRetries: 3, delay: 100 },
      });

      const mockCalls = (ipcRenderer.invoke as any).mock.calls;
      const relevantCalls = mockCalls.filter(
        (call: any) => call[0] === channel
      );
      // Verifica se houve pelo menos 1 retry (total de 2 chamadas)
      expect(relevantCalls.length).toBeGreaterThanOrEqual(2);
      // Verifica se o payload contém a flag shouldFail
      relevantCalls.forEach((call: any) => {
        expect(call[1]).toHaveProperty("shouldFail", true);
      });
    });
  });

  describe("Performance", () => {
    it("should measure roundtrip time for queries", async () => {
      const start = performance.now();
      await ipcService.invokeHandler("query:agent:list", undefined);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100); // ms
      console.log(`Query roundtrip took ${duration.toFixed(2)}ms`);
    });
  });
});
