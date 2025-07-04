import { injectable, inject } from "inversify";

import { PROJECT_REPOSITORY_INTERFACE_TYPE, SOURCE_CODE_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/i-logger.service";
import { NotFoundError } from "@/core/domain/common/errors";
import { IProjectRepository } from "@/core/domain/project/ports/project-repository.interface";
import { ProjectId } from "@/core/domain/project/value-objects/project-id.vo";
import { ISourceCodeRepository } from "@/core/domain/source-code/ports/source-code-repository.interface";

import {
  IUseCaseResponse,
  successUseCaseResponse,
} from "@/shared/application/use-case-response.dto";




import {
  GetProjectDetailsUseCaseInput,
  GetProjectDetailsUseCaseOutput,
  SourceCodeDetails,
} from "./get-project-details.schema";

@injectable()
export class GetProjectDetailsUseCase
  implements
    IUseCase<
      GetProjectDetailsUseCaseInput,
      IUseCaseResponse<GetProjectDetailsUseCaseOutput>
    >
{
  constructor(
    @inject(PROJECT_REPOSITORY_INTERFACE_TYPE) private readonly projectRepository: IProjectRepository,
    @inject(SOURCE_CODE_REPOSITORY_INTERFACE_TYPE) private readonly sourceCodeRepository: ISourceCodeRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  async execute(
    input: GetProjectDetailsUseCaseInput,
  ): Promise<IUseCaseResponse<GetProjectDetailsUseCaseOutput>> {
    const projectIdVo = ProjectId.fromString(input.projectId);

    const project = await this.projectRepository.findById(projectIdVo);

    if (!project) {
      throw new NotFoundError('Project', input.projectId);
    }

    let sourceCodeDetails: SourceCodeDetails | null = null;
    const sourceCodeEntity = await this.sourceCodeRepository.findByProjectId(projectIdVo);

    if (sourceCodeEntity) {
      sourceCodeDetails = {
        id: sourceCodeEntity.id.value,
        repositoryPath: sourceCodeEntity.path.value,
        docsPath: sourceCodeEntity.docsPath?.value ?? null,
      };
    }

    const output: GetProjectDetailsUseCaseOutput = {
      id: project.id.value,
      name: project.name.value,
      description: project.description?.value ?? null,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      sourceCode: sourceCodeDetails,
    };

    return successUseCaseResponse(output);
  }
}