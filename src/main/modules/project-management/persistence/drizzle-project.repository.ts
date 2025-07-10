import { BaseRepository } from '@/main/persistence/base.repository';
import { Project } from '@/main/modules/project-management/domain/project.entity';
import { projects } from '@/main/persistence/schema';
import type { IProjectRepository } from '@/main/modules/project-management/domain/project.repository';
import type { NodeSQLiteDatabase } from 'drizzle-orm/node-sqlite';
import type { InferSelectModel } from 'drizzle-orm/sqlite-core';

export class DrizzleProjectRepository extends BaseRepository<Project, typeof projects> implements IProjectRepository {
  constructor(db: NodeSQLiteDatabase<any>) {
    super(db, projects);
  }

  protected mapToDomainEntity(row: InferSelectModel<typeof projects>): Project {
    return Project.fromPersistence(row);
  }
}
