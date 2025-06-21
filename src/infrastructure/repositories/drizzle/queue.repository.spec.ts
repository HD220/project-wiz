import { DrizzleQueueRepository } from "./queue.repository";
import { Queue } from "../../../core/domain/entities/queue/queue.entity";
import { Job } from "../../../core/domain/entities/jobs/job.entity";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import { mockLogger } from "../../../../tests/mocks/logger.mock";
import { setupTestDB, teardownTestDB } from "../../../../tests/setup/drizzle";
import { Result } from "../../../shared/result";
import { TransactionWrapper } from "../../services/drizzle/transaction-wrapper";

describe("DrizzleQueueRepository", () => {
  let repository: DrizzleQueueRepository;
  let dbInstance: any;
  let transactionWrapper: TransactionWrapper;

  beforeAll(async () => {
    dbInstance = await setupTestDB();
    transactionWrapper = new TransactionWrapper(dbInstance.db, mockLogger);
    repository = new DrizzleQueueRepository(mockLogger, dbInstance.db);
  });

  afterAll(async () => {
    await teardownTestDB(dbInstance);
  });

  function createMockQueue(id: string, name: string): Queue {
    return {
      getId: () => id,
      getName: () => name,
      getCreatedAt: () => new Date(),
      getUpdatedAt: () => new Date(),
    } as unknown as Queue;
  }

  function createMockJob(id: string): Job {
    return {
      getId: () => id,
      getStatus: () => ({ current: "WAITING" }),
      getPriority: () => 1,
    } as unknown as Job;
  }

  describe("Validações", () => {
    describe("save", () => {
      it("deve lançar erro quando queue for nulo", async () => {
        await expect(repository.save(null as unknown as Queue)).rejects.toThrow(
          "Queue parameter cannot be null or undefined"
        );
      });

      it("deve lançar erro quando queueId for nulo", async () => {
        const mockQueue = createMockQueue(
          null as unknown as string,
          "mock-queue"
        );
        await expect(repository.save(mockQueue)).rejects.toThrow(
          "Queue ID cannot be null or undefined"
        );
      });
    });

    // ... outros testes de validação
  });

  describe("Operações CRUD", () => {
    let testQueue: Queue;
    let testJob: Job;

    beforeEach(() => {
      testQueue = createMockQueue("test-queue-id", "test-queue");
      testJob = createMockJob("test-job-id");
    });

    describe("Transações", () => {
      it("deve usar o TransactionWrapper para operações", async () => {
        const spy = vi.spyOn(transactionWrapper, "runInTransaction");
        await repository.save(testQueue);
        expect(spy).toHaveBeenCalled();
      });

      it("deve fazer rollback em caso de erro", async () => {
        vi.spyOn(transactionWrapper, "runInTransaction").mockImplementationOnce(
          () => {
            throw new Error("Simulated error");
          }
        );

        await expect(repository.save(testQueue)).rejects.toThrow(
          "Simulated error"
        );
        expect(mockLogger.error).toHaveBeenCalled();
      });
    });

    describe("findById", () => {
      it("deve retornar null quando a fila não existe", async () => {
        const result = await repository.findById("non-existent-id");
        expect(result).toBeNull();
      });

      it("deve encontrar uma fila existente", async () => {
        await repository.create(testQueue);
        const result = await repository.findById("test-queue-id");
        expect(result).toBeDefined();
        expect(result?.getId()).toBe("test-queue-id");
      });
    });

    // ... outros testes CRUD
  });

  describe("Operações de Job", () => {
    beforeAll(async () => {
      const testQueue = createMockQueue("job-test-queue-id", "job-test-queue");
      await repository.create(testQueue);
    });

    describe("getNextJob", () => {
      it("deve retornar o próximo job disponível", async () => {
        const result: Result<Job | null> = await repository.getNextJob();
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBeDefined();
        }
      });
    });

    // ... outros testes de operações de Job
  });
});
