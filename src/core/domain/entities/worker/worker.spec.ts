import { Worker, WorkerBuilder } from "./worker.entity";
import { WorkerId } from "./value-objects/worker-id.vo";
import { WorkerStatus } from "./value-objects/worker-status.vo";

describe("Worker Entity", () => {
  describe("Creation", () => {
    it("should create a valid worker with all required fields", () => {
      const worker = new Worker({
        id: new WorkerId("1"),
        name: "test-worker",
        status: WorkerStatus.available(),
        createdAt: new Date(),
      });

      expect(worker.id.value).toBe("1");
      expect(worker.name).toBe("test-worker");
      expect(worker.status.value).toBe("available");
      expect(worker.createdAt).toBeInstanceOf(Date);
      expect(worker.updatedAt).toBeUndefined();
    });

    it("should throw error when creating worker with empty name", () => {
      expect(() => {
        new Worker({
          id: new WorkerId("1"),
          name: "",
          status: WorkerStatus.available(),
          createdAt: new Date(),
        });
      }).toThrow();
    });

    it("should throw error when missing required fields", () => {
      expect(() => {
        new Worker({
          id: new WorkerId("1"),
          name: "test",
          status: undefined as unknown as WorkerStatus,
          createdAt: new Date(),
        });
      }).toThrow();
    });
  });

  describe("Getters", () => {
    const worker = new Worker({
      id: new WorkerId("1"),
      name: "test-worker",
      status: WorkerStatus.available(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it("should return correct id", () => {
      expect(worker.id.value).toBe("1");
    });

    it("should return correct name", () => {
      expect(worker.name).toBe("test-worker");
    });

    it("should return correct status", () => {
      expect(worker.status.value).toBe("available");
    });

    it("should return correct createdAt", () => {
      expect(worker.createdAt).toBeInstanceOf(Date);
    });

    it("should return correct updatedAt when defined", () => {
      expect(worker.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("State Transitions", () => {
    const initialWorker = new Worker({
      id: new WorkerId("1"),
      name: "test-worker",
      status: WorkerStatus.available(),
      createdAt: new Date(),
    });

    it("should allocate worker to job", () => {
      const allocatedWorker = initialWorker.allocateToJob();
      expect(allocatedWorker.status.value).toBe("busy");
      expect(allocatedWorker.updatedAt).toBeInstanceOf(Date);
    });

    it("should release worker", () => {
      const releasedWorker = initialWorker.release();
      expect(releasedWorker.status.value).toBe("available");
      expect(releasedWorker.updatedAt).toBeInstanceOf(Date);
    });

    it("should check if worker is available", () => {
      expect(initialWorker.isAvailable()).toBe(true);
      const busyWorker = initialWorker.allocateToJob();
      expect(busyWorker.isAvailable()).toBe(false);
    });
  });

  describe("WorkerBuilder", () => {
    it("should build a valid worker", () => {
      const worker = new WorkerBuilder()
        .withId(new WorkerId("1"))
        .withName("test-worker")
        .withStatus(WorkerStatus.available())
        .withCreatedAt(new Date())
        .build();

      expect(worker).toBeInstanceOf(Worker);
      expect(worker.id.value).toBe("1");
      expect(worker.name).toBe("test-worker");
      expect(worker.status.value).toBe("available");
    });

    it("should throw error when building with missing required fields", () => {
      expect(() => {
        new WorkerBuilder()
          .withId(new WorkerId("1"))
          .withName("test-worker")
          .build();
      }).toThrow();
    });
  });
});
