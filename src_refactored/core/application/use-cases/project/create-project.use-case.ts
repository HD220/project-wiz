import { injectable, inject } from 'inversify';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service'; // Corrected import

import { IProjectRepository, ProjectRepositoryToken } from '@/domain/project/ports/project-repository.interface';
import { ProjectEntity, ProjectProps } from '@/domain/project/project.entity';
import { ProjectDescription } from '@/domain/project/value-objects/project-description.vo';
import { ProjectId } from '@/domain/project/value-objects/project-id.vo';
import { ProjectName } from '@/domain/project/value-objects/project-name.vo';

import { ApplicationError, DomainError, ValidationError } from '@/application/common/errors';
import { IUseCase } from '@/application/common/ports/use-case.interface';

import { Result, ok, error as resultError, isSuccess, isError } from '@/shared/result'; // Import helpers

import { CreateProjectInput, CreateProjectOutput, CreateProjectInputSchema } from './create-project.schema';

@injectable()
export class CreateProjectUseCase implements IUseCase<CreateProjectInput, Promise<Result<CreateProjectOutput, DomainError>>> {
  constructor(
    @inject(ProjectRepositoryToken) private readonly projectRepository: IProjectRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger, // Corrected token and type
  ) {}

  async execute(input: CreateProjectInput): Promise<Result<CreateProjectOutput, DomainError>> {
    this.logger.info(`[CreateProjectUseCase] Attempting to create project with name: ${input.name}`);

    const validationResult = this._validateInput(input);
    if (isError(validationResult)) { // Corrected usage
      return resultError(validationResult.error); // Corrected usage
    }
    const validatedInput = validationResult.value;

    try {
      const projectEntityResult = this._createProjectEntity(validatedInput);
      if (isError(projectEntityResult)) { // Corrected usage
        return resultError(projectEntityResult.error); // Corrected usage
      }
      const projectEntity = projectEntityResult.value;

      const saveResult = await this.projectRepository.save(projectEntity);
      if (isError(saveResult)) { // Corrected usage
        this.logger.error('[CreateProjectUseCase] Failed to save project to repository', saveResult.error);
        return resultError(saveResult.error); // Corrected usage
      }

      this.logger.info(`[CreateProjectUseCase] Project created successfully: ${projectEntity.id.value}`);
      return ok(this._mapToOutput(projectEntity)); // Corrected usage

    } catch (err: unknown) { // Changed 'error' to 'err' to avoid conflict with imported 'error'
      this.logger.error('[CreateProjectUseCase] Unexpected error while creating project', err);
      const message = err instanceof Error ? err.message : String(err);
      return resultError(new ApplicationError(`An unexpected error occurred: ${message}`)); // Corrected usage
    }
  }

  private _validateInput(input: CreateProjectInput): Result<CreateProjectInput, ValidationError> {
    const validationResult = CreateProjectInputSchema.safeParse(input);
    if (!validationResult.success) {
      const errorMessage = 'Invalid input for CreateProjectUseCase';
      this.logger.error(`[CreateProjectUseCase] ${errorMessage}`, validationResult.error.flatten());
      return resultError(new ValidationError(errorMessage, validationResult.error.flatten().fieldErrors)); // Corrected usage
    }
    return ok(validationResult.data); // Corrected usage
  }

  private _createProjectEntity(validatedInput: CreateProjectInput): Result<ProjectEntity, DomainError> {
    try {
      const projectName = ProjectName.create(validatedInput.name);

      let projectDescription: ProjectDescription | undefined;
      if (validatedInput.description !== undefined && validatedInput.description !== null) {
        // Ensure description is not just empty string before creating, or let VO handle empty string if that's valid
        if (validatedInput.description.trim() !== "") {
          projectDescription = ProjectDescription.create(validatedInput.description);
        }
      }

      const projectProps: ProjectProps = {
        id: ProjectId.create(),
        name: projectName,
        description: projectDescription,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const projectEntity = ProjectEntity.create(projectProps);
      return ok(projectEntity);

    } catch (e: unknown) {
      // Catch errors from ProjectName.create, ProjectDescription.create, ProjectEntity.create
      if (e instanceof DomainError || e instanceof ValueError || e instanceof EntityError) {
        this.logger.warn(`[CreateProjectUseCase] Domain error creating project entity parts: ${e.message}`, { error: e });
        return resultError(e);
      }
      const message = e instanceof Error ? e.message : String(e);
      this.logger.error(`[CreateProjectUseCase] Unexpected error creating project entity parts: ${message}`, { error: e });
      return resultError(new DomainError(`Unexpected error creating project entity parts: ${message}`));
    }
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
