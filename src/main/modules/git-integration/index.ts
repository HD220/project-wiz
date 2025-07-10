import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { GitService } from "./git.service";
import {
  CloneRepositoryCommandHandler,
  CloneRepositoryCommand,
} from "./application/commands/clone-repository.command";
import {
  InitializeRepositoryCommandHandler,
  InitializeRepositoryCommand,
} from "./application/commands/initialize-repository.command";
import {
  PullRepositoryCommandHandler,
  PullRepositoryCommand,
} from "./application/commands/pull-repository.command";

export function registerGitIntegrationModule(cqrsDispatcher: CqrsDispatcher) {
  // TODO: Pass the actual project base directory
  const gitService = new GitService("./");

  const cloneRepositoryCommandHandler = new CloneRepositoryCommandHandler(
    gitService,
  );
  const initializeRepositoryCommandHandler =
    new InitializeRepositoryCommandHandler(gitService);
  const pullRepositoryCommandHandler = new PullRepositoryCommandHandler(
    gitService,
  );

  cqrsDispatcher.registerCommandHandler(
    CloneRepositoryCommand.name,
    cloneRepositoryCommandHandler.handle.bind(cloneRepositoryCommandHandler),
  );
  cqrsDispatcher.registerCommandHandler(
    InitializeRepositoryCommand.name,
    initializeRepositoryCommandHandler.handle.bind(
      initializeRepositoryCommandHandler,
    ),
  );
  cqrsDispatcher.registerCommandHandler(
    PullRepositoryCommand.name,
    pullRepositoryCommandHandler.handle.bind(pullRepositoryCommandHandler),
  );
}
