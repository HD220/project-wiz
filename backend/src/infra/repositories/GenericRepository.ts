import { IRepository } from "@/application/interfaces/IRepository";
import { Knex } from "knex";
import { z } from "zod";

export class GenericRepository<
  TableSchema extends z.AnyZodObject,
  TableName extends string,
  Entitie extends z.infer<TableSchema>,
  Pk extends keyof Entitie,
> implements IRepository<Entitie>
{
  constructor(
    private db: Knex,
    private tableName: TableName,
    private schema: TableSchema,
    private primaryKey: Pk
  ) {}

  async save(entity: Partial<Entitie>): Promise<Entitie> {
    const pk_value = entity[this.primaryKey];
    const statement = this.db(this.tableName).returning("*");

    if (pk_value) {
      const data = this.schema.partial().parse(entity);
      delete data[this.primaryKey];
      statement.update(entity).where(this.primaryKey, pk_value).returning("*");
    } else {
      this.schema.parse(entity);
      statement.insert(entity).returning("*");
    }
    const [result] = await statement;
    return result as Entitie;
  }

  async delete(pk: Entitie[Pk]): Promise<boolean> {
    const result = await this.db(this.tableName)
      .where(this.primaryKey, pk)
      .del();
    return result > 0;
  }

  async find(
    criteria?: Partial<Entitie>,
    page: number = 1,
    page_size: number = 10
  ): Promise<{
    data: Entitie[];
    page: number;
    page_size: number;
    total_pages: number;
  }> {
    const statement = this.db(this.tableName)
      .limit(page_size)
      .offset(page_size * (page - 1));
    if (criteria) {
      statement.where(criteria);
    }
    const result = await statement;
    const total = await this.count(criteria);

    return {
      data: result,
      page,
      page_size,
      total_pages: Math.ceil(total / (page_size || 1)),
    };
  }

  async findByPk(pk: Entitie[Pk]): Promise<Entitie> {
    const {
      data: [entity],
    } = await this.find({
      [this.primaryKey]: pk,
    } as unknown as Partial<Entitie>);
    return entity;
  }

  async count(criteria?: Partial<Entitie>): Promise<number> {
    const statement = this.db(this.tableName).count({ count: "*" });
    if (criteria) {
      statement.where(criteria);
    }

    const [{ count }] = await statement;
    return Number(count || 0);
  }
}
