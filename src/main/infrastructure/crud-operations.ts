import { eq, desc } from "drizzle-orm";
import { z } from "zod";

import { getDatabase } from "./database";
import { getLogger } from "./logger";

import type { AnySQLiteTable } from "drizzle-orm/sqlite-core";
import type { SQL } from "drizzle-orm";

/**
 * Operações CRUD genéricas para reduzir duplicação
 */
export class CrudOperations<T extends AnySQLiteTable> {
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

// Enhanced CRUD pattern for domain entities
export interface EntityCrudOperations<Entity, CreateInput, UpdateInput> {
  create(input: CreateInput): Promise<Entity>;
  findById(id: string): Promise<Entity | null>;
  findAll(): Promise<Entity[]>;
  update(id: string, input: UpdateInput): Promise<Entity>;
  delete(id: string): Promise<void>;
}

// Factory for standardized CRUD operations
export function createEntityCrud<Entity, CreateInput, UpdateInput>({
  table,
  entityName,
  createSchema,
  updateSchema,
  entityFactory,
}: {
  table: any;
  entityName: string;
  createSchema: z.ZodSchema<CreateInput>;
  updateSchema: z.ZodSchema<UpdateInput>;
  entityFactory: (data: any) => Entity;
}): EntityCrudOperations<Entity, CreateInput, UpdateInput> {
  const logger = getLogger(entityName.toLowerCase());

  return {
    async create(input: CreateInput): Promise<Entity> {
      try {
        const validated = createSchema.parse(input);
        const db = getDatabase();

        const result = await db.insert(table).values(validated).returning();

        const entity = entityFactory(result[0]);
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

        return result.length > 0 ? entityFactory(result[0]) : null;
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

        return result.map(entityFactory);
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

        const entity = entityFactory(result[0]);
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

// Helper for creating standardized entity schemas
export function createEntitySchema<T extends Record<string, any>>(
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

export class DomainValidationError extends Error {
  constructor(
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = "DomainValidationError";
  }
}
