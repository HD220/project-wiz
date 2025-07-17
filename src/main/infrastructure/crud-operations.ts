import { eq } from "drizzle-orm";

import { getDatabase } from "./database";
import { getLogger } from "./logger";

import type { AnyPgTable } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";

/**
 * Operações CRUD genéricas para reduzir duplicação
 */
export class CrudOperations<T extends AnyPgTable> {
  private logger;

  constructor(
    private table: T,
    private loggerContext: string,
  ) {
    this.logger = getLogger(loggerContext);
  }

  async updateRecord(
    id: string | number,
    data: Partial<T["$inferInsert"]>,
    idField: keyof T["_"]["columns"] = "id" as keyof T["_"]["columns"],
  ): Promise<T["$inferSelect"]> {
    try {
      const db = getDatabase();

      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      const [updated] = await db
        .update(this.table)
        .set(updateData)
        .where(eq(this.table[idField], id))
        .returning();

      if (!updated) {
        throw new Error(`Record not found: ${id}`);
      }

      this.logger.info(`Record updated: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error("Failed to update record", { error, id, data });
      throw error;
    }
  }

  async deleteRecord(
    id: string | number,
    idField: keyof T["_"]["columns"] = "id" as keyof T["_"]["columns"],
  ): Promise<void> {
    try {
      const db = getDatabase();

      const [deleted] = await db
        .delete(this.table)
        .where(eq(this.table[idField], id))
        .returning();

      if (!deleted) {
        throw new Error(`Record not found: ${id}`);
      }

      this.logger.info(`Record deleted: ${id}`);
    } catch (error) {
      this.logger.error("Failed to delete record", { error, id });
      throw error;
    }
  }

  async toggleField(
    id: string | number,
    field: keyof T["_"]["columns"],
    value: boolean,
    idField: keyof T["_"]["columns"] = "id" as keyof T["_"]["columns"],
  ): Promise<void> {
    try {
      const db = getDatabase();

      const [updated] = await db
        .update(this.table)
        .set({
          [field]: value,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(this.table[idField], id))
        .returning();

      if (!updated) {
        throw new Error(`Record not found: ${id}`);
      }

      this.logger.info(`Record ${field} toggled to ${value}: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to toggle ${String(field)}`, {
        error,
        id,
        value,
      });
      throw error;
    }
  }

  async bulkUpdate(
    where: SQL,
    data: Partial<T["$inferInsert"]>,
  ): Promise<void> {
    try {
      const db = getDatabase();

      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await db.update(this.table).set(updateData).where(where);

      this.logger.info("Bulk update completed");
    } catch (error) {
      this.logger.error("Failed to bulk update", { error, data });
      throw error;
    }
  }
}
