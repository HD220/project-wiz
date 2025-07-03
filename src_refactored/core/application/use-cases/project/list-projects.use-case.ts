import { injectable, inject } from "inversify";

import { PROJECT_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/i-logger.service";
import { IProjectRepository } from "@/core/domain/project/ports/project-repository.interface";
import { Project } from "@/core/domain/project/project.entity";

import {
  IUseCaseResponse,
  successUseCaseResponse,
} from "@/shared/application/use-case-response.dto";




import {
  ListProjectsUseCaseInput,
  ListProjectsUseCaseOutput,
  ProjectListItem,
} from "./list-projects.schema";

@injectable()
export class ListProjectsUseCase
  implements
    IUseCase<
      ListProjectsUseCaseInput,
      ListProjectsUseCaseOutput
    >
{
  constructor(
    @inject(PROJECT_REPOSITORY_INTERFACE_TYPE) private readonly projectRepository: IProjectRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  async execute(
    _input: ListProjectsUseCaseInput,
  ): Promise<IUseCaseResponse<ListProjectsUseCaseOutput>> {
    const projects = await this.projectRepository.findAll();

    const outputItems: ListProjectsUseCaseOutput = projects.map(
      (project: Project): ProjectListItem => {
        const createdAtDate = project.createdAt;

        return {
          id: project.id.value(),
          name: project.name.value(),
          createdAt: createdAtDate.toISOString(),
        };
      },
    );

    return successUseCaseResponse(outputItems);
  }
}