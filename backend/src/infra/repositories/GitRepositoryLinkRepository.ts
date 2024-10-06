import { GitRepositoryLink } from "@/application/domain/entities/GitRepositoryLink";
import { IRepository } from "@/application/interfaces/IRepository";
import { Knex } from "knex";

export class GitRepositoryLinkRepository
  implements IRepository<GitRepositoryLink>
{
  private db: Knex;
  private tableName = "git_repositories" as const;

  constructor(db: Knex) {
    this.db = db;
  }

  async save(entity: GitRepositoryLink): Promise<GitRepositoryLink> {
    const { id, ...data } = entity;
    const existingEntity = await this.db(this.tableName).where({ id }).first();
    if (existingEntity) {
      const [updatedEntity] = await this.db(this.tableName)
        .update(data)
        .where({ id })
        .returning("*");
      return this.toEntitie(updatedEntity);
    } else {
      const [createdEntity] = await this.db(this.tableName)
        .insert(entity)
        .returning("*");
      return this.toEntitie(createdEntity);
    }
  }

  async findById(id: string | number): Promise<GitRepositoryLink | null> {
    const entity = await this.db(this.tableName).where({ id }).first();
    return entity ? this.toEntitie(entity) : null;
  }

  async findAll(
    page = 1,
    pageSize = 10
  ): Promise<{
    data: GitRepositoryLink[];
    page: number;
    pageSize: number;
    total: number;
  }> {
    const offset = (page - 1) * pageSize;
    const total = await this.count();
    const data = await this.db(this.tableName).limit(pageSize).offset(offset);
    return {
      data: data.map(this.toEntitie),
      page,
      pageSize,
      total,
    };
  }

  async delete(id: string | number): Promise<boolean> {
    const deletedRows = await this.db(this.tableName).where({ id }).delete();
    return deletedRows > 0;
  }

  async findByCriteria(
    criteria: Partial<GitRepositoryLink>,
    page = 1,
    pageSize = 10
  ): Promise<{
    data: GitRepositoryLink[];
    page: number;
    pageSize: number;
    total: number;
  }> {
    const offset = (page - 1) * pageSize;
    const total = await this.count(criteria);
    const data = await this.db(this.tableName)
      .where(criteria)
      .limit(pageSize)
      .offset(offset);
    return { data: data.map(this.toEntitie), page, pageSize, total };
  }

  async count(criteria?: Partial<GitRepositoryLink>): Promise<number> {
    const [total] = await this.db(this.tableName)
      .where(criteria || {})
      .count({ count: "*" });
    return total.count as number;
  }

  toEntitie(props: GitRepositoryLink) {
    return new GitRepositoryLink(props);
  }
}
