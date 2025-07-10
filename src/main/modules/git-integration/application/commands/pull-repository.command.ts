import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { GitService } from "@/main/modules/git-integration/domain/git.service";

export class PullRepositoryCommand implements ICommand<undefined> {
  readonly type = "PullRepositoryCommand";

  constructor() {}

  get payload() {
    return undefined;
  }
}

export class PullRepositoryCommandHandler {
  constructor(private gitService: GitService) {}

  async handle(_command: PullRepositoryCommand): Promise<string> {
    try {
      return await this.gitService.pull();
    } catch (error: unknown) {
      console.error(`Failed to pull repository:`, error);
      throw new Error(`Failed to pull repository: ${(error as Error).message}`);
    }
  }
}
