import { getDatabase } from "../database";
import { getLogger } from "../logger";
import type { AnySQLiteTable } from "drizzle-orm/sqlite-core";
import type { SQL } from "drizzle-orm";

export class BulkUpdater<T extends AnySQLiteTable> {
  private logger;

  constructor(
    private table: T,
    loggerContext: string,
  ) {
    this.logger = getLogger(loggerContext);
  }

  async execute(where: SQL, data: Partial<T["$inferInsert"]>): Promise<void> {
    const updateData = this.prepareUpdateData(data);
    await this.performBulkUpdate(where, updateData);
    this.logSuccess();
  }

  private prepareUpdateData(data: Partial<T["$inferInsert"]>) {
    return {
      ...data,
      updatedAt: new Date().toISOString(),
    };
  }

  private async performBulkUpdate(
    where: SQL,
    data: Partial<T["$inferInsert"]>,
  ): Promise<void> {
    try {
      const db = getDatabase();
      await db.update(this.table).set(data).where(where);
    } catch (error) {
      this.logger.error("Failed to bulk update", { error, data });
      throw error;
    }
  }

  private logSuccess(): void {
    this.logger.info("Bulk update completed");
  }
}
