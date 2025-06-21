// Exemplos completos de testes com transações
// Referência: ../testing-guide.md#testes-com-transações

import { describe, it, expect, vi } from "vitest";
import { TransactionWrapper } from "../../src/infrastructure/services/drizzle/transaction-wrapper";
import { setupTestDB } from "../../tests/setup/drizzle";
import { jobs } from "../../src/infrastructure/services/drizzle/schemas/jobs";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

/**
 * Exemplo 1: Teste de transação bem-sucedida
 */
describe("Successful Transaction", () => {
  it("should commit when operation succeeds", async () => {
    const db = await setupTestDB();
    const wrapper = new TransactionWrapper(db.db);

    const result = await wrapper.runInTransaction(async (tx) => {
      await tx.insert(jobs).values({
        id: "job-1",
        queueId: "queue-1",
        name: "test-job",
        data: JSON.stringify({ test: true }),
        opts: JSON.stringify({ priority: 1 }),
        status: "pending",
        updatedAt: new Date(),
      });
      return "success";
    });

    expect(result).toBe("success");

    // Verifica se os dados foram persistidos
    const persistedJobs = await db.db.select().from(jobs);
    expect(persistedJobs).toHaveLength(1);
  });
});

/**
 * Exemplo 2: Teste de rollback automático
 */
describe("Transaction Rollback", () => {
  it("should rollback all changes on failure", async () => {
    const db = await setupTestDB();
    const wrapper = new TransactionWrapper(db.db);

    try {
      await wrapper.runInTransaction(async (tx) => {
        await tx.insert(jobs).values({
          id: "job-rollback",
          queueId: "queue-1",
          name: "test-job",
          data: JSON.stringify({ test: true }),
          opts: JSON.stringify({ priority: 1 }),
          status: "pending",
          updatedAt: new Date(),
        });
        throw new Error("Simulated failure");
      });
    } catch (error) {
      expect(error.message).toBe("Simulated failure");
    }

    // Verifica se o rollback ocorreu
    const persistedJobs = await db.db.select().from(jobs);
    expect(persistedJobs).toHaveLength(0);
  });
});

/**
 * Exemplo 3: Teste de concorrência
 */
describe("Concurrent Transactions", () => {
  it("should handle multiple transactions correctly", async () => {
    const db = await setupTestDB();
    const wrapper = new TransactionWrapper(db.db);
    const count = 10;

    // Executa transações concorrentes
    const promises = Array(count)
      .fill(0)
      .map(async (_, i) => {
        return wrapper.runInTransaction(async (tx) => {
          await tx.insert(jobs).values({
            id: `job-concurrent-${i}`,
            queueId: "queue-1",
            name: "test-job",
            data: JSON.stringify({ test: true }),
            opts: JSON.stringify({ priority: 1 }),
            status: "pending",
            updatedAt: new Date(),
          });
        });
      });

    await Promise.all(promises);

    // Verifica se todas as transações foram commitadas
    const persistedJobs = await db.db.select().from(jobs);
    expect(persistedJobs).toHaveLength(count);
  });
});

/**
 * Exemplo 4: Mock de transações em testes unitários
 */
describe("Unit Testing with Transaction Mocks", () => {
  it("should mock transaction behavior", async () => {
    const mockDb = {
      transaction: vi.fn().mockImplementation((callback) => {
        const mockTx = {
          insert: vi.fn().mockReturnThis(),
          values: vi.fn().mockResolvedValue({}),
        };
        return callback(mockTx);
      }),
    } as unknown as BetterSQLite3Database;

    const wrapper = new TransactionWrapper(mockDb);
    await wrapper.runInTransaction(async (tx) => {
      await tx.insert(jobs).values({
        id: "job-mock",
        queueId: "queue-1",
        name: "test-job",
        data: JSON.stringify({}),
        opts: JSON.stringify({}),
        status: "pending",
        updatedAt: new Date(),
      });
    });

    expect(mockDb.transaction).toHaveBeenCalled();
  });
});
