import { AppError } from "@/core/common/errors";
import { Executable } from "@/core/common/executable";
import { IdentityType } from "@/core/common/identity";
import { error, ok, Result } from "@/shared/result";
import {
  ProjectDescription,
  ProjectName,
} from "@/core/domain/entities/project/value-objects";
import {
  RepositoryDocsPath,
  RepositoryPath,
} from "@/core/domain/entities/source-code/value-objects";
import { IFileSystem } from "@/core/ports/adapter/file-system.interface";
import { IVersionControlSystem } from "@/core/ports/adapter/version-control-system.interface";
import { IProjectRepository } from "@/core/ports/repositories/project.interface";
import { ISourceCodeRepository } from "@/core/ports/repositories/source-code.interface";

export class CreateProjectUseCase implements Executable<Input, Output> {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly sourceCodeRepository: ISourceCodeRepository,
    private readonly fileSystem: IFileSystem,
    private readonly vcs: IVersionControlSystem
  ) {}

  async execute(input: Input): Promise<Result<Output>> {
    try {
      const { name: projectName, description: projectDescription } = input;

      const project = await this.projectRepository.create({
        name: new ProjectName(projectName),
        description: new ProjectDescription(projectDescription),
      });

      const dirbase = `${project.id.value}`;
      const dirs = await this.prepareFolders(dirbase);
      await this.setupRepository(dirs.code);

      await this.sourceCodeRepository.create({
        path: new RepositoryPath(dirs.code),
        docsPath: new RepositoryDocsPath(dirs.docs),
        projectId: project.id,
      });

      return ok({
        projectId: project.id.value,
      });
    } catch (err) {
      if (err instanceof AppError) {
        return error(err.message);
      }

      const errorMessage = err instanceof Error ? err.message : String(err);
      return error(errorMessage);
    }
  }

  private async setupRepository(dirname: string) {
    await this.vcs.changeWorkingDirectory(dirname);
    await this.vcs.init();
  }

  private async prepareFolders(dirname: string) {
    const dirs = {
      code: `${dirname}/source-code`,
      docs: `${dirname}/source-code/docs`,
      worktree: `${dirname}/worktrees`,
    };
    await this.fileSystem.mkdir(dirs.worktree);
    await this.fileSystem.mkdir(dirs.code);
    await this.fileSystem.mkdir(dirs.docs);
    return dirs;
  }
}

type Input = {
  name: string;
  description?: string;
};

type Output = {
  projectId: IdentityType;
};
