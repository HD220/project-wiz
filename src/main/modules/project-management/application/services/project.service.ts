import { Project } from "../domain/entities/project.entity";
import { ProjectRepository } from "../domain/repositories/project.repository";
import { EventBus } from "@/main/kernel/event-bus";
import logger from "@/main/logger";

export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly eventBus: EventBus,
  ) {}

  async createProject(props: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const project = new Project({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.projectRepository.save(project);
    logger.info(`Project created: ${project.name}`);
    this.eventBus.publish('project.created', project);
    return project;
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.projectRepository.findById(id);
  }

  async getProjectByName(name: string): Promise<Project | null> {
    return this.projectRepository.findByName(name);
  }

  async getAllProjects(): Promise<Project[]> {
    return this.projectRepository.findAll();
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new Error(`Project with ID ${id} not found.`);
    }

    // Apply updates
    Object.assign(project.props, updates);
    project.touch(); // Update updatedAt timestamp

    await this.projectRepository.update(project);
    logger.info(`Project updated: ${project.name}`);
    this.eventBus.publish('project.updated', project);
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await this.projectRepository.delete(id);
    logger.info(`Project deleted: ${id}`);
    this.eventBus.publish('project.deleted', { id });
  }
}