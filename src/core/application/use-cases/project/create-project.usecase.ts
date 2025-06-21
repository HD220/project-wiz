import { Executable } from "@/core/common/executable";
import { error, ok, Result } from "@/shared/result";
import {
  CreateProjectUseCaseInput,
  CreateProjectOutputSchema, // Output schema not needed for output type directly
  CreateProjectInputSchema,
  CreateProjectUseCaseOutput,
} from "./create-project.schema";
import { Project } from "@/core/domain/entities/project"; // Import Project entity
import {
  ProjectDescription,
  ProjectId, // Import ProjectId
  ProjectName,
} from "@/core/domain/entities/project/value-objects";
import { SourceCode } from "@/core/domain/entities/source-code"; // Import SourceCode entity
import {
  RepositoryDocsPath,
  RepositoryId, // Import RepositoryId
  RepositoryPath,
} from "@/core/domain/entities/source-code/value-objects";
import { IFileSystem } from "@/core/ports/adapter/file-system.interface";
import { IVersionControlSystem } from "@/core/ports/adapter/version-control-system.interface";
import { IProjectRepository } from "@/core/ports/repositories/project.interface";
import { ISourceCodeRepository } from "@/core/ports/repositories/source-code.interface";
import { DomainError } from "@/core/common/errors"; // Import DomainError


interface PrepareFoldersOutput {
  code: string;
  docs: string;
  worktree: string;
}

export class CreateProjectUseCase
  implements Executable<CreateProjectUseCaseInput, Result<CreateProjectUseCaseOutput>> {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly sourceCodeRepository: ISourceCodeRepository,
    private readonly fileSystem: IFileSystem,
    private readonly vcs: IVersionControlSystem
  ) {}

  async execute(input: CreateProjectUseCaseInput): Promise<Result<CreateProjectUseCaseOutput>> {
    const validationResult = CreateProjectInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error.flatten().fieldErrors as any); // Cast for simplicity
    }
    const validInput = validationResult.data;

    try {
      const projectIdVo = ProjectId.create(); // Generates UUID
      const nameVo = ProjectName.create(validInput.name);
      const descriptionVo = ProjectDescription.create(validInput.description || "");

      const project = Project.create({ // Use static create method
        id: projectIdVo,
        name: nameVo,
        description: descriptionVo
      });

      const saveProjectResult = await this.projectRepository.save(project);
      if (saveProjectResult.isError()) {
        return error(new DomainError(`Failed to save project: ${saveProjectResult.message}`));
      }

      const dirbase = project.id().getValue(); // Use id() and getValue()

      const prepareFoldersResult = await this.prepareFolders(dirbase);
      if (prepareFoldersResult.isError()) {
        return error(new DomainError(`Failed to prepare folders: ${prepareFoldersResult.message}`));
      }
      const dirs = prepareFoldersResult.value;

      const setupRepoResult = await this.setupRepository(dirs.code);
      if (setupRepoResult.isError()) {
        return error(new DomainError(`Failed to setup repository: ${setupRepoResult.message}`));
      }

      const sourceCodeIdVo = RepositoryId.create(); // Generates new ID
      const repoPathVo = RepositoryPath.create(dirs.code);
      const docsPathVo = RepositoryDocsPath.create(dirs.docs);

      const sourceCode = SourceCode.create({ // Use static create method
        id: sourceCodeIdVo,
        path: repoPathVo,
        docsPath: docsPathVo,
        projectId: project.id(), // Pass ProjectId VO
      });

      const saveSourceCodeResult = await this.sourceCodeRepository.save(sourceCode);
      if (saveSourceCodeResult.isError()) {
        return error(new DomainError(`Failed to save source code: ${saveSourceCodeResult.message}`));
      }

      return ok({
        projectId: project.id().getValue(),
      });
    } catch (err) {
      console.error("Unexpected error in CreateProjectUseCase:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      return error(new DomainError(errorMessage));
    }
  }

  private async setupRepository(dirname: string): Promise<Result<void>> {
    // These VCS methods should return Result
    const cdResult = await this.vcs.changeWorkingDirectory(dirname);
    if (cdResult.isError()) return error(cdResult.message);

    const initResult = await this.vcs.init();
    if (initResult.isError()) return error(initResult.message);

    return ok(undefined);
  }

  private async prepareFolders(dirname: string): Promise<Result<PrepareFoldersOutput>> {
    const dirs: PrepareFoldersOutput = {
      code: `${dirname}/source-code`,
      docs: `${dirname}/source-code/docs`,
      worktree: `${dirname}/worktrees`,
    };

    // Each mkdir should return Result
    let result = await this.fileSystem.mkdir(dirs.worktree);
    if (result.isError()) return error(result.message);

    result = await this.fileSystem.mkdir(dirs.code);
    if (result.isError()) return error(result.message);

    result = await this.fileSystem.mkdir(dirs.docs);
    if (result.isError()) return error(result.message);

    return ok(dirs);
  }
}

// Removed local type Input and Output
