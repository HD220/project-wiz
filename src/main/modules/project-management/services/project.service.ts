import { ProjectEntity } from "../entities/project.entity";
import { ProjectRepository, ProjectFilterOptions } from "../persistence/repository";
import {
  CreateProjectData,
  UpdateProjectData,
  ProjectData,
} from "../entities/project.schema";

export class ProjectService {
  constructor(private repository: ProjectRepository) {}

  async createProject(data: CreateProjectData): Promise<ProjectData> {
    const project = new ProjectEntity(data);
    const saved = await this.repository.save(project.toPlainObject());
    return saved;
  }

  async listProjects(filter?: ProjectFilterOptions): Promise<ProjectData[]> {
    return this.repository.findMany(filter);
  }

  async getProjectById(data: { id: string }): Promise<ProjectData | null> {
    return this.repository.findById(data.id);
  }

  async updateProject(data: UpdateProjectData): Promise<ProjectData> {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Project not found");
    }

    const project = new ProjectEntity(existing);

    if (data.name !== undefined) {
      project.updateName({ name: data.name });
    }
    if (data.description !== undefined) {
      project.updateDescription({ description: data.description });
    }
    if (data.gitUrl !== undefined) {
      project.updateGitUrl({ gitUrl: data.gitUrl });
    }

    return this.repository.update(project.toPlainObject());
  }

  async deleteProject(data: { id: string }): Promise<void> {
    await this.repository.delete(data.id);
  }

  async archiveProject(data: { id: string }): Promise<ProjectData> {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Project not found");
    }

    const project = new ProjectEntity(existing);
    project.archive();

    return this.repository.update(project.toPlainObject());
  }
}