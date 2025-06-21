import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDB, teardownTestDB } from "../../../setup/drizzle";
import { DrizzleQueueRepository } from "@/infrastructure/repositories/drizzle/queue.repository";
import { Queue } from "@/core/domain/entities/queue/queue.entity";

// Mock do logger que implementa ILogger
const mockLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

describe("DrizzleQueueRepository - Integration Tests", () => {
  let repository: DrizzleQueueRepository;
  let db: Awaited<ReturnType<typeof setupTestDB>>;

  beforeAll(async () => {
    db = await setupTestDB();
    repository = new DrizzleQueueRepository(mockLogger, db.db);
  });

  afterAll(async () => {
    await teardownTestDB(db);
  });

  // [Todos os outros testes permanecem inalterados...]

  describe("getNextJob", () => {
    it("deve retornar null quando não houver jobs disponíveis", async () => {
      const result = await repository.getNextJob();
      if (result.success) {
        expect(result.data).toBeNull();
      } else {
        throw new Error("Expected success but got error");
      }
    });

    it("deve retornar erro quando ocorrer falha na query", async () => {
      const mockError = new Error("Database error");
      const originalDb = (repository as any).db;
      (repository as any).db = {
        select: () => ({
          from: () => ({
            where: () => ({
              orderBy: () => ({
                limit: () => Promise.reject(mockError),
              }),
            }),
          }),
        }),
      };

      const result = await repository.getNextJob();
      if (!result.success) {
        expect(result.error.name).toBe("GetNextJobError");
      } else {
        throw new Error("Expected error but got success");
      }

      (repository as any).db = originalDb;
    });
  });
});
