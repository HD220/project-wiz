import { RecordUpdater } from "./crud/record-updater";
import { RecordDeleter } from "./crud/record-deleter";
import { FieldToggler } from "./crud/field-toggler";
import { BulkUpdater } from "./crud/bulk-updater";
import type { AnySQLiteTable } from "drizzle-orm/sqlite-core";
import type { SQL } from "drizzle-orm";

// Re-export modular components
export { RecordUpdater } from "./crud/record-updater";
export { RecordDeleter } from "./crud/record-deleter";
export { FieldToggler } from "./crud/field-toggler";
export { BulkUpdater } from "./crud/bulk-updater";

// Re-export entity factory and interfaces
export type { EntityCrudOperations } from "./crud/entity-crud-factory";
export { createEntityCrud } from "./crud/entity-crud-factory";

// Re-export validation utilities
export {
  commonValidations,
  createEntitySchema,
} from "./crud/common-validations";

// Re-export error classes
export { EntityNotFoundError, DomainValidationError } from "./crud/crud-errors";

// Facade for maintaining backward compatibility
export class CrudOperations<T extends AnySQLiteTable> {
  private updater: RecordUpdater<T>;
  private deleter: RecordDeleter<T>;
  private toggler: FieldToggler<T>;
  private bulkUpdater: BulkUpdater<T>;

  constructor(
    private table: T,
    private loggerContext: string,
  ) {
    this.updater = new RecordUpdater(table, loggerContext);
    this.deleter = new RecordDeleter(table, loggerContext);
    this.toggler = new FieldToggler(table, loggerContext);
    this.bulkUpdater = new BulkUpdater(table, loggerContext);
  }

  async updateRecord(
    id: string | number,
    data: Partial<T["$inferInsert"]>,
    idField: keyof T["_"]["columns"] = "id" as keyof T["_"]["columns"],
  ): Promise<T["$inferSelect"]> {
    return this.updater.execute(id, data, idField);
  }

  async deleteRecord(
    id: string | number,
    idField: keyof T["_"]["columns"] = "id" as keyof T["_"]["columns"],
  ): Promise<void> {
    return this.deleter.execute(id, idField);
  }

  async toggleField(
    id: string | number,
    field: keyof T["_"]["columns"],
    value: boolean,
    idField: keyof T["_"]["columns"] = "id" as keyof T["_"]["columns"],
  ): Promise<void> {
    return this.toggler.execute(id, field, value, idField);
  }

  async bulkUpdate(
    where: SQL,
    data: Partial<T["$inferInsert"]>,
  ): Promise<void> {
    return this.bulkUpdater.execute(where, data);
  }
}
