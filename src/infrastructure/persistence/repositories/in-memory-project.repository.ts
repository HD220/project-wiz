import { Project, ProjectCreationProps, ProjectUpdateProps } from "@/core/domain/entities/project.entity";
import { IProjectRepository } from "@/core/domain/repositories/project.repository";

// Mock data for initial state
const mockProjects: Project[] = [
  {
    id: "proj-1",
    name: "Project Alpha",
    description: "A groundbreaking project.",
    lastActivity: new Date().toISOString(),
    status: "active",
    agentCount: 5,
    taskCount: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-2",
    name: "Project Beta",
    description: "Another exciting venture.",
    lastActivity: new Date().toISOString(),
    status: "planning",
    agentCount: 2,
    taskCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class InMemoryProjectRepository implements IProjectRepository {
  private projects: Map<string, Project>;

  constructor() {
    this.projects = new Map(mockProjects.map(project => [project.id, project]));
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.projects.get(id) || null;
  }

  async createProject(projectProps: ProjectCreationProps): Promise<Project> {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      ...projectProps,
      lastActivity: new Date().toISOString(),
      status: "active",
      agentCount: 0,
      taskCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(newProject.id, newProject);
    return newProject;
  }

  async updateProject(id: string, updates: ProjectUpdateProps): Promise<Project | null> {
    const project = this.projects.get(id);
    if (!project) {
      return null;
    }
    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }
}
