import { injectable, inject } from 'inversify';

import { ILoggerService, LoggerServiceToken } from '@/core/common/services/i-logger.service';

import { IProjectRepository, ProjectRepositoryToken } from '@/domain/project/ports/project-repository.interface';
import { ProjectEntity, ProjectProps } from '@/domain/project/project.entity';
import { ProjectDescription } from '@/domain/project/value-objects/project-description.vo';
import { ProjectId } from '@/domain/project/value-objects/project-id.vo';
import { ProjectName } from '@/domain/project/value-objects/project-name.vo';

import { ApplicationError, DomainError, ValidationError } from '@/application/common/errors';
import { IUseCase } from '@/application/common/ports/use-case.interface';

import { Result } from '@/shared/result';

import { CreateProjectInput, CreateProjectOutput, CreateProjectInputSchema } from './create-project.schema';

@injectable()
export class CreateProjectUseCase implements IUseCase<CreateProjectInput, Promise<Result<CreateProjectOutput, DomainError>>> {
  constructor(
    @inject(ProjectRepositoryToken) private readonly projectRepository: IProjectRepository,
    @inject(LoggerServiceToken) private readonly logger: ILoggerService,
  ) {}

  async execute(input: CreateProjectInput): Promise<Result<CreateProjectOutput, DomainError>> {
    this.logger.info(`[CreateProjectUseCase] Attempting to create project with name: ${input.name}`);

    const validationResult = this._validateInput(input);
    if (validationResult.isFailure()) {
      return Result.fail(validationResult.error);
    }
    const validatedInput = validationResult.value;

    try {
      const projectEntityResult = this._createProjectEntity(validatedInput);
      if (projectEntityResult.isFailure()) {
        return Result.fail(projectEntityResult.error);
      }
      const projectEntity = projectEntityResult.value;

      const saveResult = await this.projectRepository.save(projectEntity);
      if (saveResult.isFailure()) {
        this.logger.error('[CreateProjectUseCase] Failed to save project to repository', saveResult.error);
        return Result.fail(saveResult.error);
      }

      this.logger.info(`[CreateProjectUseCase] Project created successfully: ${projectEntity.id.value}`);
      return Result.ok(this._mapToOutput(projectEntity));

    } catch (error: unknown) {
      this.logger.error('[CreateProjectUseCase] Unexpected error while creating project', error);
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(new ApplicationError(`An unexpected error occurred: ${message}`));
    }
  }

  private _validateInput(input: CreateProjectInput): Result<CreateProjectInput, ValidationError> {
    const validationResult = CreateProjectInputSchema.safeParse(input);
    if (!validationResult.success) {
      const errorMessage = 'Invalid input for CreateProjectUseCase';
      this.logger.error(`[CreateProjectUseCase] ${errorMessage}`, validationResult.error.flatten());
      return Result.fail(new ValidationError(errorMessage, validationResult.error.flatten().fieldErrors));
    }
    return Result.ok(validationResult.data);
  }

  private _createProjectEntity(validatedInput: CreateProjectInput): Result<ProjectEntity, DomainError> {
    const projectNameResult = ProjectName.create(validatedInput.name);
    if (projectNameResult.isFailure()) {
      this.logger.warn(`[CreateProjectUseCase] Invalid project name: ${validatedInput.name}`, projectNameResult.error);
      return Result.fail(projectNameResult.error);
    }

    let projectDescription: ProjectDescription | undefined;
    if (validatedInput.description !== undefined && validatedInput.description !== null) {
      const projectDescriptionResult = ProjectDescription.create(validatedInput.description);
      if (projectDescriptionResult.isFailure()) {
        this.logger.warn(`[CreateProjectUseCase] Invalid project description`, projectDescriptionResult.error);
        return Result.fail(projectDescriptionResult.error);
      }
      projectDescription = projectDescriptionResult.value;
    }

    const projectProps: ProjectProps = {
      id: ProjectId.create(),
      name: projectNameResult.value,
      description: projectDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const projectEntityResult = ProjectEntity.create(projectProps);
    if (projectEntityResult.isFailure()) {
      this.logger.error('[CreateProjectUseCase] Failed to create project entity', projectEntityResult.error);
      return Result.fail(projectEntityResult.error);
    }
    return Result.ok(projectEntityResult.value);
  }

  private _mapToOutput(projectEntity: ProjectEntity): CreateProjectOutput {
    return {
      id: projectEntity.id.value,
      name: projectEntity.name.value,
      description: projectEntity.description?.value,
      createdAt: projectEntity.createdAt.toISOString(),
      updatedAt: projectEntity.updatedAt.toISOString(),
    };
  }
}
