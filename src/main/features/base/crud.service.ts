import { eq } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";

import type { SQLiteTable } from "drizzle-orm/sqlite-core";

export abstract class CrudService<
  TTable extends SQLiteTable,
  TSelect,
  TInsert,
> {
  protected abstract table: TTable;

  async create(input: TInsert): Promise<TSelect> {
    const db = getDatabase();

    const [record] = await db.insert(this.table).values(input).returning();

    if (!record) {
      throw new Error("Failed to create record");
    }

    return record as TSelect;
  }

  async findById(id: string): Promise<TSelect | null> {
    const db = getDatabase();

    const [record] = await db
      .select()
      .from(this.table)
      .where(eq((this.table as any).id, id))
      .limit(1);

    return (record as TSelect) || null;
  }

  async update(id: string, input: Partial<TInsert>): Promise<TSelect> {
    const db = getDatabase();

    const [record] = await db
      .update(this.table)
      .set(input)
      .where(eq((this.table as any).id, id))
      .returning();

    if (!record) {
      throw new Error("Record not found or update failed");
    }

    return record as TSelect;
  }

  async delete(id: string): Promise<void> {
    const db = getDatabase();

    await db.delete(this.table).where(eq((this.table as any).id, id));
  }

  async findAll(): Promise<TSelect[]> {
    const db = getDatabase();

    const records = await db.select().from(this.table);

    return records as TSelect[];
  }
}
