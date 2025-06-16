import { Queue, QueueBuilder } from "./queue.entity";
import { QueueId } from "./value-objects/queue-id.vo";
import { QueueStatus } from "./value-objects/queue-status.vo";

describe("Queue Entity", () => {
  describe("Creation", () => {
    it("should create a valid queue with all required fields", () => {
      const queue = new Queue({
        id: new QueueId("1"),
        name: "test-queue",
        status: new QueueStatus("ACTIVE"),
        createdAt: new Date(),
      });

      expect(queue.id.value).toBe("1");
      expect(queue.name).toBe("test-queue");
      expect(queue.status.value).toBe("ACTIVE");
      expect(queue.createdAt).toBeInstanceOf(Date);
      expect(queue.updatedAt).toBeUndefined();
    });

    it("should throw error when creating queue with empty name", () => {
      expect(() => {
        new Queue({
          id: new QueueId("1"),
          name: "",
          status: new QueueStatus("ACTIVE"),
          createdAt: new Date(),
        });
      }).toThrow();
    });

    it("should throw error when missing required fields", () => {
      expect(() => {
        new Queue({
          id: new QueueId("1"),
          name: "test",
          status: undefined as unknown as QueueStatus,
          createdAt: new Date(),
        });
      }).toThrow();
    });
  });

  describe("Getters", () => {
    const queue = new Queue({
      id: new QueueId("1"),
      name: "test-queue",
      status: new QueueStatus("ACTIVE"),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it("should return correct id", () => {
      expect(queue.id.value).toBe("1");
    });

    it("should return correct name", () => {
      expect(queue.name).toBe("test-queue");
    });

    it("should return correct status", () => {
      expect(queue.status.value).toBe("ACTIVE");
    });

    it("should return correct createdAt", () => {
      expect(queue.createdAt).toBeInstanceOf(Date);
    });

    it("should return correct updatedAt when defined", () => {
      expect(queue.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("State Transitions", () => {
    const initialQueue = new Queue({
      id: new QueueId("1"),
      name: "test-queue",
      status: new QueueStatus("ACTIVE"),
      createdAt: new Date(),
    });

    it("should activate queue", () => {
      const activatedQueue = initialQueue.activate();
      expect(activatedQueue.status.value).toBe("ACTIVE");
      expect(activatedQueue.updatedAt).toBeInstanceOf(Date);
    });

    it("should pause queue", () => {
      const pausedQueue = initialQueue.pause();
      expect(pausedQueue.status.value).toBe("PAUSED");
      expect(pausedQueue.updatedAt).toBeInstanceOf(Date);
    });

    it("should drain queue", () => {
      const drainedQueue = initialQueue.drain();
      expect(drainedQueue.status.value).toBe("DRAINING");
      expect(drainedQueue.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("QueueBuilder", () => {
    it("should build a valid queue", () => {
      const queue = new QueueBuilder()
        .withId(new QueueId("1"))
        .withName("test-queue")
        .withStatus(new QueueStatus("ACTIVE"))
        .withCreatedAt(new Date())
        .build();

      expect(queue).toBeInstanceOf(Queue);
      expect(queue.id.value).toBe("1");
      expect(queue.name).toBe("test-queue");
      expect(queue.status.value).toBe("ACTIVE");
    });

    it("should throw error when building with missing required fields", () => {
      expect(() => {
        new QueueBuilder()
          .withId(new QueueId("1"))
          .withName("test-queue")
          .build();
      }).toThrow();
    });
  });
});
