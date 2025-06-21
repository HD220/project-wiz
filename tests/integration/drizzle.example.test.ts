import { describe, it, expect } from "vitest";
import { db, setupTestDB } from "../setup/drizzle";
import { sql } from "drizzle-orm";

describe("Drizzle Database", () => {
  setupTestDB();

  it("should be able to connect to database", async () => {
    const result = await db.run(sql`SELECT name FROM sqlite_master`);
    expect(result).toBeDefined();
  });
});
