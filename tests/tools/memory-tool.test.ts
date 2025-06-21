import { describe, it, expect, beforeEach } from "vitest";
import { SqliteMemoryTool } from "../../src/infrastructure/tools/sqlite-memory-tool";
import { createTestDatabase, createMockVectorStore } from "../utils/test-utils";

interface MemoryRecord {
  id: string;
  content: string;
  metadata: string;
  tags: string;
  timestamp: number;
  embedding: string;
}

describe("SqliteMemoryTool", () => {
  let db: ReturnType<typeof createTestDatabase>;
  let memoryTool: SqliteMemoryTool;
  let mockVectorStore: ReturnType<typeof createMockVectorStore>;

  beforeEach(() => {
    db = createTestDatabase();
    db.exec(`
      CREATE TABLE agent_memory (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        metadata TEXT NOT NULL,
        tags TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        embedding TEXT NOT NULL
      )
    `);

    mockVectorStore = createMockVectorStore();
    memoryTool = new SqliteMemoryTool(db, mockVectorStore.vectorStore);
  });

  describe("write", () => {
    it("should write a record to memory", async () => {
      const result = await memoryTool.write({
        content: "Test content",
        metadata: { key: "value" },
        tags: ["tag1"],
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
      expect(result.timestamp).toBeGreaterThan(0);

      const record = db
        .prepare("SELECT * FROM agent_memory WHERE id = ?")
        .get(result.id) as MemoryRecord;
      expect(record.content).toBe("Test content");
    });
  });

  describe("delete", () => {
    it("should delete a record from memory", async () => {
      const writeResult = await memoryTool.write({ content: "To be deleted" });
      const deleteResult = await memoryTool.delete({ id: writeResult.id });

      expect(deleteResult.success).toBe(true);
      expect(deleteResult.deletedCount).toBe(1);
    });
  });

  describe("search", () => {
    it("should perform semantic search", async () => {
      const testId = "test-id-123";
      mockVectorStore.mockQuery.mockImplementation(() =>
        Promise.resolve([{ id: testId, score: 0.9 }])
      );

      db.prepare(
        `
        INSERT INTO agent_memory (id, content, metadata, tags, timestamp, embedding)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      ).run(testId, "Test content", "{}", "[]", Date.now(), "[0.1,0.2,0.3]");

      const results = await memoryTool.search("test query");
      expect(results[0].content).toBe("Test content");
      expect(results[0].relevanceScore).toBe(0.9);
    });
  });
});
