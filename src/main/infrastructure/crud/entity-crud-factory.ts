import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { getDatabase } from "../database";
import { getLogger } from "../logger";
import { EntityNotFoundError } from "./crud-errors";
import type { AnySQLiteTable } from "drizzle-orm/sqlite-core";

export interface EntityCrudOperations<Entity, CreateInput, UpdateInput> {
  create(input: CreateInput): Promise<Entity>;
  findById(id: string): Promise<Entity | null>;
  findAll(): Promise<Entity[]>;
  update(id: string, input: UpdateInput): Promise<Entity>;
  delete(id: string): Promise<void>;
}

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
