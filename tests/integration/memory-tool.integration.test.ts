import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { SqliteMemoryTool } from "../../src/infrastructure/tools/sqlite-memory-tool";
import { createTestDatabase } from "../utils/test-utils";
import { MockVectorStore } from "../mocks/vector-store.mock";
import type { Database } from "better-sqlite3";

describe("SqliteMemoryTool Integration", () => {
  let db: ReturnType<typeof createTestDatabase>;
  let memoryTool: SqliteMemoryTool;
  let vectorStore: MockVectorStore;

  beforeAll(() => {
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

    vectorStore = new MockVectorStore();
    memoryTool = new SqliteMemoryTool(db, vectorStore);
  });

  afterAll(() => {
    db.close();
  });

  it("should perform full CRUD operations", async () => {
    // Create
    const writeResult = await memoryTool.write({
      content: "Integration test content",
      metadata: { test: true },
      tags: ["integration"],
    });
    expect(writeResult.success).toBe(true);

    // Read (via search)
    vectorStore.setMockResults([
      {
        id: writeResult.id,
        score: 0.95,
      },
    ]);
    const searchResults = await memoryTool.search("test content");
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].content).toBe("Integration test content");

    // Delete
    const deleteResult = await memoryTool.delete({ id: writeResult.id });
    expect(deleteResult.success).toBe(true);
    expect(deleteResult.deletedCount).toBe(1);
  });
});
