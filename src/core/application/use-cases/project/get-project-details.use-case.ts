import { injectable, inject } from "inversify";

import { PROJECT_REPOSITORY_INTERFACE_TYPE, SOURCE_CODE_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/logger.port";
import { NotFoundError } from "@/core/domain/common/common-domain.errors";
import { IProjectRepository } from "@/core/domain/project/ports/project-repository.interface";
import { ProjectId } from "@/core/domain/project/value-objects/project-id.vo";
import { ISourceCodeRepository } from "@/core/domain/source-code/ports/source-code-repository.interface";

import {
  GetProjectDetailsUseCaseInput,
  GetProjectDetailsUseCaseOutput,
} from "./get-project-details.schema";

@injectable()
export class GetProjectDetailsUseCase
  implements
    IUseCase<
      GetProjectDetailsUseCaseInput,
      GetProjectDetailsUseCaseOutput
    >
{
  constructor(
    @inject(PROJECT_REPOSITORY_INTERFACE_TYPE) private readonly projectRepository: IProjectRepository,
    @inject(SOURCE_CODE_REPOSITORY_INTERFACE_TYPE) private readonly sourceCodeRepository: ISourceCodeRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  public async execute(input: GetProjectDetailsUseCaseInput): Promise<GetProjectDetailsUseCaseOutput> {
    const { projectId } = input;
    const id = ProjectId.fromString(projectId);

    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundError('Project', projectId);
    }

    const sourceCode = await this.sourceCodeRepository.findByProjectId(id);

    return {
      id: project.id.value,
      name: project.name.value,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      description: project.description?.value || null,
      sourceCode: sourceCode ? {
        id: sourceCode.id.value,
        repositoryPath: sourceCode.path.value,
        docsPath: sourceCode.docsPath?.value || null,
      } : null,
    };
  }
}