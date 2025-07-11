import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { Table } from 'drizzle-orm';
import type { BaseEntity } from '@kernel/domain/base.entity';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';

import type { AnySQLiteTable } from 'drizzle-orm/sqlite-core';

export abstract class BaseRepository<TEntity extends BaseEntity, TSchema extends AnySQLiteTable> {
  protected constructor(
    protected db: BetterSQLite3Database<any>,
    protected schema: TSchema
  ) {}

  protected abstract mapToDomainEntity(row: InferSelectModel<TSchema>): TEntity;

  async findById(id: string): Promise<TEntity | null> {
    const [result] = await this.db.select().from(this.schema).where(eq(this.schema.id, id)).limit(1);
    return result ? this.mapToDomainEntity(result) : null;
  }

  async save(entity: TEntity): Promise<void> {
    await this.db.insert(this.schema).values(entity.toPersistence() as InferInsertModel<TSchema>)
      .onConflictDoUpdate({ target: (this.schema as any).id, set: entity.toPersistence() as InferInsertModel<TSchema> });
  }

  async findAll(): Promise<TEntity[]> {
    const results = await this.db.select().from(this.schema);
    return results.map((row) => this.mapToDomainEntity(row));
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.delete(this.schema).where(eq(this.schema.id, id));
    return result.changes > 0;
  }
}
