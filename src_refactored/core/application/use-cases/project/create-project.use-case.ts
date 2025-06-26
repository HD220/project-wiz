import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/result';
import { IUseCase } from '../../common/ports/use-case.interface';
import { CreateProjectInput, CreateProjectOutput, CreateProjectInputSchema } from './create-project.schema';
import { ProjectEntity, ProjectProps } from '../../../domain/project/project.entity';
import { ProjectName } from '../../../domain/project/value-objects/project-name.vo';
import { ProjectDescription } from '../../../domain/project/value-objects/project-description.vo';
import { IProjectRepository, ProjectRepositoryToken } from '../../../domain/project/ports/project-repository.interface';
import { LoggerServiceToken, ILoggerService } from '../../../common/services/i-logger.service';
import { DomainError, ValidationError, ApplicationError } from '../../../common/errors';
import { ProjectId } from '../../../domain/project/value-objects/project-id.vo'; // For generating new ID

@injectable()
export class CreateProjectUseCase implements IUseCase<CreateProjectInput, Promise<Result<CreateProjectOutput, DomainError>>> {
  constructor(
    @inject(ProjectRepositoryToken) private readonly projectRepository: IProjectRepository,
    @inject(LoggerServiceToken) private readonly logger: ILoggerService,
  ) {}

  async execute(input: CreateProjectInput): Promise<Result<CreateProjectOutput, DomainError>> {
    this.logger.info(`[CreateProjectUseCase] Attempting to create project with name: ${input.name}`);

    const validationResult = CreateProjectInputSchema.safeParse(input);
    if (!validationResult.success) {
      const errorMessage = 'Invalid input for CreateProjectUseCase';
      this.logger.error(`[CreateProjectUseCase] ${errorMessage}`, validationResult.error.flatten());
      return Result.fail(new ValidationError(errorMessage, validationResult.error.flatten().fieldErrors));
    }

    const validatedInput = validationResult.data;

    try {
      const projectNameResult = ProjectName.create(validatedInput.name);
      if (projectNameResult.isFailure()) {
        this.logger.warn(`[CreateProjectUseCase] Invalid project name: ${validatedInput.name}`, projectNameResult.error);
        return Result.fail(projectNameResult.error);
      }

      let projectDescriptionResult: Result<ProjectDescription, DomainError> | undefined;
      if (validatedInput.description !== undefined && validatedInput.description !== null) {
        projectDescriptionResult = ProjectDescription.create(validatedInput.description);
        if (projectDescriptionResult.isFailure()) {
          this.logger.warn(`[CreateProjectUseCase] Invalid project description`, projectDescriptionResult.error);
          return Result.fail(projectDescriptionResult.error);
        }
      }

      const projectProps: ProjectProps = {
        id: ProjectId.create(), // Generate new Project ID
        name: projectNameResult.value,
        description: projectDescriptionResult ? projectDescriptionResult.value : undefined,
        // sourceCode: [], // Assuming new project starts with no source code entities linked
        // annotations: [], // Assuming new project starts with no annotations
        // memory: undefined, // Assuming new project starts with no specific memory linked
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const projectEntityResult = ProjectEntity.create(projectProps);
      if (projectEntityResult.isFailure()) {
        this.logger.error('[CreateProjectUseCase] Failed to create project entity', projectEntityResult.error);
        return Result.fail(projectEntityResult.error);
      }
      const projectEntity = projectEntityResult.value;

      const saveResult = await this.projectRepository.save(projectEntity);
      if (saveResult.isFailure()) {
        this.logger.error('[CreateProjectUseCase] Failed to save project to repository', saveResult.error);
        return Result.fail(saveResult.error);
      }

      this.logger.info(`[CreateProjectUseCase] Project created successfully: ${projectEntity.id.value}`);

      const output: CreateProjectOutput = {
        id: projectEntity.id.value,
        name: projectEntity.name.value,
        description: projectEntity.description?.value,
        createdAt: projectEntity.createdAt.toISOString(),
        updatedAt: projectEntity.updatedAt.toISOString(),
      };
      return Result.ok(output);

    } catch (error: any) {
      this.logger.error('[CreateProjectUseCase] Unexpected error while creating project', error);
      return Result.fail(new ApplicationError(`An unexpected error occurred: ${error.message}`));
    }
  }
}
