import { eq, desc } from "drizzle-orm";
import { z } from "zod";

import { getDatabase } from "./database";
import { getLogger } from "./logger";

import type { AnySQLiteTable } from "drizzle-orm/sqlite-core";
import type { SQL } from "drizzle-orm";

/**
 * Operações CRUD genéricas para reduzir duplicação
 */
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

  private validateDeletion(deleted: any, id: string | number): void {
    if (!deleted) {
      throw new Error(`Record not found: ${id}`);
    }
  }

  private logSuccess(id: string | number): void {
    this.logger.info(`Record deleted: ${id}`);
  }
}

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
    data: any,
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

  private validateToggle(updated: any, id: string | number): void {
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

// Facade para manter compatibilidade
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

// Enhanced CRUD pattern for domain entities
export interface EntityCrudOperations<Entity, CreateInput, UpdateInput> {
  create(input: CreateInput): Promise<Entity>;
  findById(id: string): Promise<Entity | null>;
  findAll(): Promise<Entity[]>;
  update(id: string, input: UpdateInput): Promise<Entity>;
  delete(id: string): Promise<void>;
}

// Type for database table record
type TableRecord = Record<string, unknown>;

// Factory for standardized CRUD operations
export function createEntityCrud<
  Entity,
  CreateInput,
  UpdateInput,
  TTable extends AnySQLiteTable,
>({
  table,
  entityName,
  createSchema,
  updateSchema,
  entityFactory,
}: {
  table: TTable;
  entityName: string;
  createSchema: z.ZodSchema<CreateInput>;
  updateSchema: z.ZodSchema<UpdateInput>;
  entityFactory: (data: TTable["$inferSelect"]) => Entity;
}): EntityCrudOperations<Entity, CreateInput, UpdateInput> {
  const logger = getLogger(entityName.toLowerCase());

  return {
    async create(input: CreateInput): Promise<Entity> {
      try {
        const validated = createSchema.parse(input);
        const db = getDatabase();

        const result = await db
          .insert(table)
          .values(validated as TTable["$inferInsert"])
          .returning();

        const entity = entityFactory(result[0] as TTable["$inferSelect"]);
        logger.info(`${entityName} created`);
        return entity;
      } catch (error) {
        logger.error(`Failed to create ${entityName.toLowerCase()}`, {
          error,
          input,
        });
        throw error;
      }
    },

    async findById(id: string): Promise<Entity | null> {
      try {
        const db = getDatabase();
        const result = await db
          .select()
          .from(table)
          .where(eq(table.id, id))
          .limit(1);

        return result.length > 0
          ? entityFactory(result[0] as TTable["$inferSelect"])
          : null;
      } catch (error) {
        logger.error(`Failed to find ${entityName.toLowerCase()}`, {
          error,
          id,
        });
        throw error;
      }
    },

    async findAll(): Promise<Entity[]> {
      try {
        const db = getDatabase();
        const result = await db
          .select()
          .from(table)
          .orderBy(desc(table.createdAt));

        return result.map((row) =>
          entityFactory(row as TTable["$inferSelect"]),
        );
      } catch (error) {
        logger.error(`Failed to find ${entityName.toLowerCase()}s`, { error });
        throw error;
      }
    },

    async update(id: string, input: UpdateInput): Promise<Entity> {
      try {
        const validated = updateSchema.parse(input);
        const db = getDatabase();

        const result = await db
          .update(table)
          .set({ ...validated, updatedAt: new Date() })
          .where(eq(table.id, id))
          .returning();

        if (result.length === 0) {
          throw new EntityNotFoundError(entityName, id);
        }

        const entity = entityFactory(result[0] as TTable["$inferSelect"]);
        logger.info(`${entityName} updated`);
        return entity;
      } catch (error) {
        logger.error(`Failed to update ${entityName.toLowerCase()}`, {
          error,
          id,
          input,
        });
        throw error;
      }
    },

    async delete(id: string): Promise<void> {
      try {
        const db = getDatabase();
        const result = await db
          .delete(table)
          .where(eq(table.id, id))
          .returning({ id: table.id });

        if (result.length === 0) {
          throw new EntityNotFoundError(entityName, id);
        }

        logger.info(`${entityName} deleted: ${id}`);
      } catch (error) {
        logger.error(`Failed to delete ${entityName.toLowerCase()}`, {
          error,
          id,
        });
        throw error;
      }
    },
  };
}

// Common validation schemas
export const commonValidations = {
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().default(""),
  email: z.string().email(),
  url: z.string().url().optional(),
  timestamps: {
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
  },
};

// Type for entity schema fields
type EntitySchemaFields = Record<string, z.ZodTypeAny>;

// Helper for creating standardized entity schemas
export function createEntitySchema<T extends EntitySchemaFields>(
  fields: T,
): z.ZodObject<
  T & {
    id: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
  }
> {
  return z.object({
    id: commonValidations.id,
    ...fields,
    createdAt: commonValidations.timestamps.createdAt,
    updatedAt: commonValidations.timestamps.updatedAt,
  });
}

// Standardized error classes
export class EntityNotFoundError extends Error {
  constructor(entityName: string, id: string) {
    super(`${entityName} not found: ${id}`);
    this.name = "EntityNotFoundError";
  }
}

// Type for validation error details
type ValidationErrorDetails = {
  field?: string;
  value?: unknown;
  errors?: string[];
};

export class DomainValidationError extends Error {
  constructor(
    message: string,
    public details?: ValidationErrorDetails,
  ) {
    super(message);
    this.name = "DomainValidationError";
  }
}
