import { BaseRepository } from "@/main/persistence/base.repository";
import { Project } from "@/main/modules/project-management/domain/project.entity";
import { projects } from "@/main/persistence/schema";
import type { IProjectRepository } from "@/main/modules/project-management/domain/project.repository";
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

export class DrizzleProjectRepository extends BaseRepository<Project, typeof projects> implements IProjectRepository {
  constructor(db: BetterSQLite3Database<any>) {
    super(db, projects);
  }

  protected mapToDomainEntity(row: any): Project {
    return Project.fromPersistence(row);
  }
}
