import { CreateProjectCommand } from "./create-project.command";
import { Project } from "@/main/modules/project-management/domain/project.entity";
import { IProjectRepository } from "@/main/modules/project-management/domain/project.repository";
import { FilesystemService } from "@/main/modules/filesystem-tools/domain/filesystem.service";
import { GitIntegrationService } from "@/main/modules/git-integration/domain/git-integration.service";
import logger from "@/main/logger";
import { ApplicationError } from "@/main/errors/application.error";

export class CreateProjectCommandHandler {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly filesystemService: FilesystemService,
    private readonly gitIntegrationService: GitIntegrationService,
  ) {}

  async handle(command: CreateProjectCommand): Promise<Project> {
    const { name, localPath, remoteUrl } = command.payload;

    // Check if project with the same name already exists
    const existingProject = await this.projectRepository.findByName(name);
    if (existingProject) {
      throw new ApplicationError(`Project with name "${name}" already exists.`);
    }

    // 1. Create project directory
    await this.filesystemService.createDirectory(localPath);
    logger.info(`Created project directory: ${localPath}`);

    // 2. Initialize Git repository or clone remote
    if (remoteUrl) {
      await this.gitIntegrationService.cloneRepository(remoteUrl, localPath);
      logger.info(`Cloned remote repository ${remoteUrl} to ${localPath}`);
    } else {
      await this.gitIntegrationService.initializeRepository(localPath);
      logger.info(`Initialized Git repository in ${localPath}`);
    }

    // 3. Create Project entity
    const project = new Project({ name, localPath, remoteUrl });

    // 4. Persist project to database
    await this.projectRepository.save(project);
    logger.info(`Saved project ${project.id} to database`);

    return project;
  }
}
