import { eq } from "drizzle-orm";
import { getDatabase } from "../database";
import { getLogger } from "../logger";
import type { AnySQLiteTable } from "drizzle-orm/sqlite-core";

export class RecordDeleter<T extends AnySQLiteTable> {
  private logger;

  constructor(
    private table: T,
    loggerContext: string,
  ) {
    this.logger = getLogger(loggerContext);
  }

  async execute(
    id: string | number,
    idField: keyof T["_"]["columns"] = "id" as keyof T["_"]["columns"],
  ): Promise<void> {
    const deleted = await this.performDelete(id, idField);
    this.validateDeletion(deleted, id);
    this.logSuccess(id);
  }

  private async performDelete(
    id: string | number,
    idField: keyof T["_"]["columns"],
  ) {
    try {
      const db = getDatabase();
      const [deleted] = await db
        .delete(this.table)
        .where(eq(this.table[idField], id))
        .returning();

      return deleted;
    } catch (error) {
      this.logger.error("Failed to delete record", { error, id });
      throw error;
    }
  }

  private validateDeletion(deleted: unknown, id: string | number): void {
    if (!deleted) {
      throw new Error(`Record not found: ${id}`);
    }
  }

  private logSuccess(id: string | number): void {
    this.logger.info(`Record deleted: ${id}`);
  }
}
