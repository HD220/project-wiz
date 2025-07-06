import { injectable, inject } from "inversify";
import { ZodError } from "zod";

import { PROJECT_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/i-logger.service";
import { IProjectRepository } from "@/core/domain/project/ports/project-repository.interface";
import { Project, ProjectProps } from "@/core/domain/project/project.entity";
import { ProjectDescription } from "@/core/domain/project/value-objects/project-description.vo";
import { ProjectId } from "@/core/domain/project/value-objects/project-id.vo";
import { ProjectName } from "@/core/domain/project/value-objects/project-name.vo";






import { CreateProjectUseCaseInput, CreateProjectUseCaseOutput, CreateProjectInputSchema } from "./create-project.schema";

@injectable()
export class CreateProjectUseCase   implements IUseCase<CreateProjectUseCaseInput, CreateProjectUseCaseOutput> {
  constructor(
    @inject(PROJECT_REPOSITORY_INTERFACE_TYPE) private readonly projectRepository: IProjectRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  public async execute(input: CreateProjectUseCaseInput): Promise<CreateProjectUseCaseOutput> {
    const { name, description } = input;

    const projectName = ProjectName.create(name);
    const projectDescription = description ? ProjectDescription.create(description) : null;

    const project = Project.create({
      id: ProjectId.generate(),
      name: projectName,
      description: projectDescription,
    });

    await this.projectRepository.save(project);

    return { projectId: project.id.value };
  }
}