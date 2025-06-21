// src/infrastructure/persistence/in-memory/repositories/project.repository.ts
import { IProjectRepository } from '@/domain/repositories/i-project.repository';
import { Project } from '@/domain/entities/project.entity';
import { injectable } from 'inversify';

@injectable()
export class InMemoryProjectRepository implements IProjectRepository {
  private projects: Map<string, Project> = new Map();

  async save(project: Project): Promise<void> {
    this.projects.set(project.id, project);
    console.log(`[InMemoryProjectRepository] Project ${project.id} saved. Total projects: ${this.projects.size}`);
  }

  async findById(id: string): Promise<Project | null> {
    const project = this.projects.get(id) || null;
    console.log(`[InMemoryProjectRepository] Finding project by ID ${id}. Found: ${!!project}`);
    return project;
  }

  async findByName(name: string): Promise<Project | null> {
    for (const project of this.projects.values()) {
      if (project.name === name) {
        console.log(`[InMemoryProjectRepository] Finding project by name "${name}". Found: ${project.id}`);
        return project;
      }
    }
    console.log(`[InMemoryProjectRepository] Finding project by name "${name}". Found: null`);
    return null;
  }

  async findAll(): Promise<Project[]> {
    const allProjects = Array.from(this.projects.values());
    console.log(`[InMemoryProjectRepository] Finding all projects. Count: ${allProjects.length}`);
    return allProjects;
  }

  async deleteById(id: string): Promise<void> {
    const deleted = this.projects.delete(id);
    console.log(`[InMemoryProjectRepository] Deleting project by ID ${id}. Deleted: ${deleted}. Total projects: ${this.projects.size}`);
  }
}
