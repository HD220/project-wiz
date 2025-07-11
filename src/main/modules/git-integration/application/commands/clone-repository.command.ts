import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { GitService } from "@/main/modules/git-integration/domain/git.service";

export class CloneRepositoryCommand
  implements
    ICommand<{
      repoUrl: string;
      localPath: string;
    }>
{
  readonly type = "CloneRepositoryCommand";

  constructor(
    public readonly repoUrl: string,
    public readonly localPath: string,
  ) {}

  get payload() {
    return { repoUrl: this.repoUrl, localPath: this.localPath };
  }
}

export class CloneRepositoryCommandHandler {
  constructor(private gitService: GitService) {}

  async handle(command: CloneRepositoryCommand): Promise<string> {
    try {
      return await this.gitService.clone(command.repoUrl, command.localPath);
    } catch (error: unknown) {
      console.error(`Failed to clone repository:`, error);
      throw new ApplicationError(
        `Failed to clone repository: ${(error as Error).message}`,
      );
    }
  }
}
