import { createIpcHandler } from "@/main/kernel/ipc-handler-utility";
import type { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import type {
  IpcGitIntegrationClonePayload,
  IpcGitIntegrationInitializePayload,
  IpcGitIntegrationPullPayload,
} from "@/shared/ipc-types/ipc-payloads";
import { CloneRepositoryCommand } from "../application/commands/clone-repository.command";
import { InitializeRepositoryCommand } from "../application/commands/initialize-repository.command";
import { PullRepositoryCommand } from "../application/commands/pull-repository.command";

export function registerGitIntegrationHandlers(cqrsDispatcher: CqrsDispatcher) {
  createIpcHandler<IpcGitIntegrationClonePayload, void>(
    IpcChannel.GIT_INTEGRATION_CLONE,
    cqrsDispatcher,
    async (payload) => {
      await cqrsDispatcher.dispatchCommand(
        new CloneRepositoryCommand(payload.repoUrl, payload.localPath),
      );
    },
  );

  createIpcHandler<IpcGitIntegrationInitializePayload, void>(
    IpcChannel.GIT_INTEGRATION_INITIALIZE,
    cqrsDispatcher,
    async (payload) => {
      await cqrsDispatcher.dispatchCommand(new InitializeRepositoryCommand());
    },
  );

  createIpcHandler<IpcGitIntegrationPullPayload, void>(
    IpcChannel.GIT_INTEGRATION_PULL,
    cqrsDispatcher,
    async (payload) => {
      await cqrsDispatcher.dispatchCommand(new PullRepositoryCommand());
    },
  );
