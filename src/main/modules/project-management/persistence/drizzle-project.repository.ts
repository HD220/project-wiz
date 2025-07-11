import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq, desc } from "drizzle-orm";
import { Project } from "../domain/entities/project.entity";
import { ProjectRepository } from "../domain/repositories/project.repository";
import { projects } from "../persistence/schema";

export class DrizzleProjectRepository implements ProjectRepository {
  constructor(private readonly db: BetterSQLite3Database<any>) {}

  async save(project: Project): Promise<void> {
    const projectData = {
      id: project.id,
      name: project.props.name,
      description: project.props.description || null,
      localPath: project.props.localPath,
      remoteUrl: project.props.remoteUrl || null,
      createdAt: project.props.createdAt.getTime(),
      updatedAt: project.props.updatedAt.getTime(),
    };

    await this.db.insert(projects).values(projectData).onConflictDoUpdate({
      target: projects.id,
      set: projectData,
    });
  }

  async findById(id: string): Promise<Project | null> {
    const [result] = await this.db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    return result ? this.mapToDomainEntity(result) : null;
  }

  async findByName(name: string): Promise<Project | null> {
    const [result] = await this.db
      .select()
      .from(projects)
      .where(eq(projects.name, name))
      .limit(1);

    return result ? this.mapToDomainEntity(result) : null;
  }

  async findAll(): Promise<Project[]> {
    const results = await this.db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt));

    return results.map(this.mapToDomainEntity);
  }

  async update(project: Project): Promise<void> {
    await this.save(project); // Reutiliza o método save que já faz upsert
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(projects).where(eq(projects.id, id));
  }

  private mapToDomainEntity(row: any): Project {
    return new Project(
      {
        name: row.name,
        description: row.description || undefined,
        localPath: row.localPath,
        remoteUrl: row.remoteUrl || undefined,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      },
      row.id,
    );
  }
}