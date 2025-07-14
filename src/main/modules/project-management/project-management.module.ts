import { BaseModule } from "../../kernel/base-module";

import { ProjectService } from "./application/project.service";
import { ProjectIpcHandlers } from "./ipc/handlers";
import { ProjectRepository } from "./persistence/project.repository";
import { ProjectMapper } from "./project.mapper";

export class ProjectManagementModule extends BaseModule {
  private projectRepository!: ProjectRepository;
  private projectService!: ProjectService;
  private projectMapper!: ProjectMapper;
  private projectIpcHandlers!: ProjectIpcHandlers;

  getName(): string {
    return "project-management";
  }

  getDependencies(): string[] {
    return []; // No dependencies
  }

  protected async onInitialize(): Promise<void> {
    this.projectRepository = new ProjectRepository();
    this.projectService = new ProjectService(this.projectRepository);
    this.projectMapper = new ProjectMapper();
    this.projectIpcHandlers = new ProjectIpcHandlers(
      this.projectService,
      this.projectMapper,
    );
  }

  protected onRegisterIpcHandlers(): void {
    this.projectIpcHandlers.registerHandlers();
  }

  // Public getters for other modules to access services
  getProjectService(): ProjectService {
    if (!this.isInitialized()) {
      throw new Error("ProjectManagementModule must be initialized first");
    }
    return this.projectService;
  }

  getProjectRepository(): ProjectRepository {
    if (!this.isInitialized()) {
      throw new Error("ProjectManagementModule must be initialized first");
    }
    return this.projectRepository;
  }
}
