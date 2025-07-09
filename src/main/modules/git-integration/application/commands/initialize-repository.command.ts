import { ICommand } from '@/main/kernel/cqrs-dispatcher';
import { GitService } from '@/main/modules/git-integration/git.service';


export class InitializeRepositoryCommand implements ICommand<undefined> {
  readonly type = 'InitializeRepositoryCommand';

  constructor() {}

  get payload() {
    return undefined;
  }
}

export class InitializeRepositoryCommandHandler {
  constructor(private gitService: GitService) {}

  async handle(_command: InitializeRepositoryCommand): Promise<string> {
    try {
      return await this.gitService.init();
    } catch (error: unknown) {
      console.error(`Failed to initialize repository:`, error);
      throw new Error(`Failed to initialize repository: ${(error as Error).message}`);
    }
  }
}
