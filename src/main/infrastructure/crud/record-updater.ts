import { eq } from "drizzle-orm";
import { getDatabase } from "../database";
import { getLogger } from "../logger";
import type { AnySQLiteTable } from "drizzle-orm/sqlite-core";

export class RecordUpdater<T extends AnySQLiteTable> {
  private logger;

  constructor(
    private table: T,
    loggerContext: string,
  ) {
    this.logger = getLogger(loggerContext);
  }

  async execute(
    id: string | number,
    data: Partial<T["$inferInsert"]>,
    idField: keyof T["_"]["columns"] = "id" as keyof T["_"]["columns"],
  ): Promise<T["$inferSelect"]> {
    const updateData = this.prepareUpdateData(data);
    const updated = await this.performUpdate(id, updateData, idField);
    this.logSuccess(id);
    return updated;
  }

  private prepareUpdateData(data: Partial<T["$inferInsert"]>) {
    return {
      ...data,
      updatedAt: new Date().toISOString(),
    };
  }

  private async performUpdate(
    id: string | number,
    data: Partial<T["$inferInsert"]>,
    idField: keyof T["_"]["columns"],
  ): Promise<T["$inferSelect"]> {
    try {
      const db = getDatabase();
      const [updated] = await db
        .update(this.table)
        .set(data)
        .where(eq(this.table[idField], id))
        .returning();

      if (!updated) {
        throw new Error(`Record not found: ${id}`);
      }

      return updated;
    } catch (error) {
      this.logger.error("Failed to update record", { error, id, data });
      throw error;
    }
  }

  private logSuccess(id: string | number): void {
    this.logger.info(`Record updated: ${id}`);
  }
}
