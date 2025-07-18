import { eq } from "drizzle-orm";
import { getDatabase } from "../database";
import { getLogger } from "../logger";
import type { AnySQLiteTable } from "drizzle-orm/sqlite-core";

export class FieldToggler<T extends AnySQLiteTable> {
  private logger;

  constructor(
    private table: T,
    loggerContext: string,
  ) {
    this.logger = getLogger(loggerContext);
  }

  async execute(
    id: string | number,
    field: keyof T["_"]["columns"],
    value: boolean,
    idField: keyof T["_"]["columns"] = "id" as keyof T["_"]["columns"],
  ): Promise<void> {
    const updateData = this.prepareToggleData(field, value);
    const updated = await this.performToggle(id, updateData, idField);
    this.validateToggle(updated, id);
    this.logSuccess(field, value, id);
  }

  private prepareToggleData(field: keyof T["_"]["columns"], value: boolean) {
    return {
      [field]: value,
      updatedAt: new Date().toISOString(),
    };
  }

  private async performToggle(
    id: string | number,
    data: Record<string, unknown>,
    idField: keyof T["_"]["columns"],
  ) {
    try {
      const db = getDatabase();
      const [updated] = await db
        .update(this.table)
        .set(data)
        .where(eq(this.table[idField], id))
        .returning();

      return updated;
    } catch (error) {
      this.logger.error("Failed to toggle field", { error, id, data });
      throw error;
    }
  }

  private validateToggle(updated: unknown, id: string | number): void {
    if (!updated) {
      throw new Error(`Record not found: ${id}`);
    }
  }

  private logSuccess(
    field: keyof T["_"]["columns"],
    value: boolean,
    id: string | number,
  ): void {
    this.logger.info(`Record ${String(field)} toggled to ${value}: ${id}`);
  }
}
