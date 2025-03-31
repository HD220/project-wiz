import { UtilityProcessManager } from "../utility-process";
import { IPCManager } from "../ipc";
import { HeartbeatMonitor } from "../__backup__/heartbeat-monitor";
import { HealthStatus } from "../__backup__/heartbeat-config";

jest.mock("./heartbeat-monitor");

describe("UtilityProcessManager", () => {
  let manager: UtilityProcessManager;
  let mockIpc: jest.Mocked<IPCManager>;
  let mockHeartbeat: jest.Mocked<HeartbeatMonitor>;

  beforeEach(() => {
    mockIpc = {
      send: jest.fn(),
      registerHandler: jest.fn(),
    } as unknown as jest.Mocked<IPCManager>;

    mockHeartbeat = {
      startMonitoring: jest.fn(),
      stopMonitoring: jest.fn(),
      on: jest.fn(),
    } as unknown as jest.Mocked<HeartbeatMonitor>;

    jest.mocked(HeartbeatMonitor).mockImplementation(() => mockHeartbeat);
    manager = new UtilityProcessManager(mockIpc);
  });

  describe("Heartbeat Integration", () => {
    it("should start heartbeat monitoring when process starts", async () => {
      await manager.startProcess();
      expect(mockHeartbeat.startMonitoring).toHaveBeenCalled();
    });

    it("should stop heartbeat monitoring when process stops", async () => {
      await manager.startProcess();
      await manager.stopProcess();
      expect(mockHeartbeat.stopMonitoring).toHaveBeenCalled();
    });

    it("should send health status updates via IPC", () => {
      const mockEvent = {
        status: "healthy" as HealthStatus,
        metrics: {
          cpuUsage: 10,
          memoryUsage: 100,
          avgResponseTime: 50,
          failureCount: 0,
          lastResponseAt: Date.now(),
        },
      };

      // Simulate heartbeat event
      const statusHandler = mockHeartbeat.on.mock.calls[0][1];
      statusHandler(mockEvent);

      expect(mockIpc.send).toHaveBeenCalledWith(
        "worker:health-status",
        mockEvent
      );
    });

    it("should restart process when restartRequired is emitted", () => {
      const mockStop = jest.spyOn(manager, "stopProcess").mockResolvedValue();
      const mockStart = jest.spyOn(manager, "startProcess").mockResolvedValue();

      // Simulate restart required
      const restartHandler = mockHeartbeat.on.mock.calls[1][1];
      restartHandler();

      expect(mockStop).toHaveBeenCalled();
      expect(mockStart).toHaveBeenCalled();
    });

    describe("Failure Handling", () => {
      it("should handle worker failure events", () => {
        const mockStop = jest.spyOn(manager, "stopProcess").mockResolvedValue();

        // Simulate failure event
        const statusHandler = mockHeartbeat.on.mock.calls[0][1];
        statusHandler({ status: "failed" });

        expect(console.error).toHaveBeenCalled();
        expect(mockStop).toHaveBeenCalled();
      });
    });

    describe("Resource Monitoring", () => {
      it("should log resource usage reports", () => {
        const testData = { cpu: 50, memory: 1024 };
        manager["monitorResourceUsage"](testData);

        expect(console.log).toHaveBeenCalledWith(
          "Resource usage report:",
          testData
        );
      });
    });
  });
});
