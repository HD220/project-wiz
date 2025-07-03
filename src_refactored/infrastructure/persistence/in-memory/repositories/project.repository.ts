import { injectable } from "inversify";

import { NotFoundError } from "@/core/domain/common/errors";
import { IProjectRepository } from "@/core/domain/project/ports/project-repository.interface";
import { Project } from "@/core/domain/project/project.entity";
import { ProjectId } from "@/core/domain/project/value-objects/project-id.vo";

@injectable()
export class InMemoryProjectRepository implements IProjectRepository {
  private readonly projects: Map<string, Project> = new Map();

  async save(project: Project): Promise<Project> {
    this.projects.set(project.id.value, project);
    return project;
  }

  async findById(id: ProjectId): Promise<Project | null> {
    const project = this.projects.get(id.value);
    return project || null;
  }

  async findByName(name: string): Promise<Project | null> {
    for (const project of this.projects.values()) {
      if (project.name.value === name) {
        return project;
      }
    }
    return null;
  }

  async listAll(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async delete(id: ProjectId): Promise<void> {
    if (!this.projects.has(id.value)) {
      throw new NotFoundError("Project", id.value);
    }
    this.projects.delete(id.value);
  }
}