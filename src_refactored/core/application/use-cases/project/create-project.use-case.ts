import { injectable, inject } from 'inversify';
import { ZodError } from 'zod'; // For ZodError type

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
// Import DomainError, ValueError, EntityError from domain/common/errors
import { DomainError, ValueError, EntityError } from '@/core/domain/common/errors';

import { IProjectRepository } from '@/domain/project/ports/project-repository.interface'; // Removed ProjectRepositoryToken
// Use Project and ProjectConstructorProps from project.entity
import { Project, ProjectConstructorProps } from '@/domain/project/project.entity';
import { ProjectDescription } from '@/domain/project/value-objects/project-description.vo';
import { ProjectId } from '@/domain/project/value-objects/project-id.vo';
import { ProjectName } from '@/domain/project/value-objects/project-name.vo';

// Import ApplicationError and ApplicationValidationError from application/common/errors
import { ApplicationError, ApplicationValidationError } from '@/application/common/errors';
import { IUseCase } from '@/application/common/ports/use-case.interface';

import { TYPES } from '@/infrastructure/ioc/types'; // For IoC token

import { Result, ok, error as resultError, isError } from '@/shared/result';

// Use schema types directly
import { CreateProjectUseCaseInput, CreateProjectUseCaseOutput, CreateProjectInputSchema } from './create-project.schema';

@injectable()
export class CreateProjectUseCase implements IUseCase<CreateProjectUseCaseInput, Promise<Result<CreateProjectUseCaseOutput, DomainError | ApplicationValidationError>>> {
  constructor(
    @inject(TYPES.IProjectRepository) private readonly projectRepository: IProjectRepository, // Use IoC Token
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  async execute(input: CreateProjectUseCaseInput): Promise<Result<CreateProjectUseCaseOutput, DomainError | ApplicationValidationError>> {
    this.logger.info(`[CreateProjectUseCase] Attempting to create project with name: ${input.name}`);

    const validationResult = this._validateInput(input); // Returns Result<CreateProjectUseCaseInput, ApplicationValidationError>
    if (isError(validationResult)) {
      return resultError(validationResult.error);
    }
    const validatedInput = validationResult.value;

    try {
      const projectEntityResult = this._createProjectEntity(validatedInput);
      if (isError(projectEntityResult)) {
        return resultError(projectEntityResult.error);
      }
      const projectEntity = projectEntityResult.value;

      const saveResult = await this.projectRepository.save(projectEntity);
      if (isError(saveResult)) {
        this.logger.error('[CreateProjectUseCase] Failed to save project to repository', saveResult.error);
        return resultError(saveResult.error);
      }

      this.logger.info(`[CreateProjectUseCase] Project created successfully: ${projectEntity.id().value()}`); // Use id()
      return ok(this._mapToOutput(projectEntity));

    } catch (caughtError: unknown) {
      const errorToLog = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
      this.logger.error(
        '[CreateProjectUseCase] Unexpected error while creating project',
        { error: errorToLog, useCase: 'CreateProjectUseCase', input }
      );
      return resultError(new ApplicationError(`An unexpected error occurred: ${errorToLog.message}`, errorToLog));
    }
  }

  private _validateInput(input: CreateProjectUseCaseInput): Result<CreateProjectUseCaseInput, ApplicationValidationError> {
    const validationResult = CreateProjectInputSchema.safeParse(input);
    if (!validationResult.success) {
      const errorMessage = 'Invalid input for CreateProjectUseCase';
      // Log the ZodError directly for more details if needed by the logger
      this.logger.error(
        `[CreateProjectUseCase] ${errorMessage}`,
        { error: validationResult.error, details: validationResult.error.flatten().fieldErrors, useCase: 'CreateProjectUseCase', input }
      );
      return resultError(new ApplicationValidationError(errorMessage, validationResult.error.flatten().fieldErrors));
    }
    return ok(validationResult.data);
  }

  private _createProjectEntity(validatedInput: CreateProjectUseCaseInput): Result<Project, DomainError> {
    try {
      const projectName = ProjectName.create(validatedInput.name);
      let projectDescription: ProjectDescription | undefined;

      if (validatedInput.description && validatedInput.description.trim() !== "") {
        projectDescription = ProjectDescription.create(validatedInput.description);
      }

      // Use ProjectConstructorProps and ProjectId.generate()
      const projectProps: ProjectConstructorProps = {
        id: ProjectId.generate(), // Changed from ProjectId.create()
        name: projectName,
        description: projectDescription,
        // createdAt and updatedAt are handled by the entity's create method
      };

      const projectEntity = Project.create(projectProps); // Use Project.create
      return ok(projectEntity);

    } catch (errorCreatingEntity: unknown) {
      const errorToLog = errorCreatingEntity instanceof Error ? errorCreatingEntity : new Error(String(errorCreatingEntity));
      if (errorCreatingEntity instanceof DomainError || errorCreatingEntity instanceof ValueError || errorCreatingEntity instanceof EntityError) {
        this.logger.warn(
          `[CreateProjectUseCase] Domain error creating project entity parts: ${errorToLog.message}`,
          { error: errorToLog, useCase: 'CreateProjectUseCase', method: '_createProjectEntity', input: validatedInput }
        );
        return resultError(errorCreatingEntity as DomainError | ValueError | EntityError); // Cast for type safety
      }
      this.logger.error(
        `[CreateProjectUseCase] Unexpected error creating project entity parts: ${errorToLog.message}`,
        { error: errorToLog, useCase: 'CreateProjectUseCase', method: '_createProjectEntity', input: validatedInput }
      );
      return resultError(new DomainError(`Unexpected error creating project entity parts: ${errorToLog.message}`, errorToLog));
    }
  }

  private _mapToOutput(projectEntity: Project): CreateProjectUseCaseOutput {
    // Assuming CreateProjectUseCaseOutput expects projectId string
    // and entity's id(), name(), description() return VOs with a value() method.
    // Also assuming entity's createdAt, updatedAt are Date objects.
    return {
      projectId: projectEntity.id().value(),
      // The schema output was projectId, not the full entity details.
      // If full details are needed, CreateProjectOutputSchema must be updated.
      // For now, sticking to the schema:
      // name: projectEntity.name().value(),
      // description: projectEntity.description()?.value(),
      // createdAt: projectEntity.createdAt().toISOString(),
      // updatedAt: projectEntity.updatedAt().toISOString(),
    };
  }
}
