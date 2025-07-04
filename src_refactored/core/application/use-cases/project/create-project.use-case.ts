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

import { IUseCaseResponse, successUseCaseResponse } from "@/shared/application/use-case-response.dto";




import { CreateProjectUseCaseInput, CreateProjectUseCaseOutput, CreateProjectInputSchema } from "./create-project.schema";

@injectable()
export class CreateProjectUseCase   implements IUseCase<CreateProjectUseCaseInput, IUseCaseResponse<CreateProjectUseCaseOutput>> {
  constructor(
    @inject(PROJECT_REPOSITORY_INTERFACE_TYPE) private readonly projectRepository: IProjectRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  async execute(input: CreateProjectUseCaseInput): Promise<IUseCaseResponse<CreateProjectUseCaseOutput>> {
    this.logger.info(`[CreateProjectUseCase] Attempting to create project with name: ${input.name}`);

    const validatedInput = this._validateInput(input);

    const projectEntity = this._createProjectEntity(validatedInput);

    const savedProject = await this.projectRepository.save(projectEntity);

    this.logger.info(`[CreateProjectUseCase] Project created successfully: ${savedProject.id.value}`);
    return successUseCaseResponse(this._mapToOutput(savedProject));
  }

  private _validateInput(input: CreateProjectUseCaseInput): CreateProjectUseCaseInput {
    const validationResult = CreateProjectInputSchema.safeParse(input);
    if (!validationResult.success) {
      const errorMessage = 'Invalid input for CreateProjectUseCase';
      this.logger.error(
        `[CreateProjectUseCase] ${errorMessage}`,
        { error: validationResult.error, details: validationResult.error.flatten().fieldErrors, useCase: 'CreateProjectUseCase', input }
      );
      throw new ZodError(validationResult.error.errors);
    }
    return validationResult.data;
  }

  private _createProjectEntity(validatedInput: CreateProjectUseCaseInput): Project {
    const projectName = ProjectName.create(validatedInput.name);
    let projectDescription: ProjectDescription | null = null;

    if (validatedInput.description && validatedInput.description.trim() !== "") {
      projectDescription = ProjectDescription.create(validatedInput.description);
    }

    const projectProps: ProjectProps = {
      id: ProjectId.generate(),
      name: projectName,
      description: projectDescription,
    };

    const projectEntity = Project.create(projectProps);
    return projectEntity;
  }

  private _mapToOutput(projectEntity: Project): CreateProjectUseCaseOutput {
    return {
      projectId: projectEntity.id.value,
    };
  }
}