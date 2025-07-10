import { ipcMain } from "electron";
import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import {
  IpcGitIntegrationClonePayload,
  IpcGitIntegrationCloneResponse,
  IpcGitIntegrationInitializePayload,
  IpcGitIntegrationInitializeResponse,
  IpcGitIntegrationPullPayload,
  IpcGitIntegrationPullResponse,
} from "@/shared/ipc-types/ipc-payloads";
import { CloneRepositoryCommand } from "../application/commands/clone-repository.command";
import { InitializeRepositoryCommand } from "../application/commands/initialize-repository.command";
import { PullRepositoryCommand } from "../application/commands/pull-repository.command";

export function registerGitIntegrationHandlers(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    IpcChannel.GIT_INTEGRATION_CLONE,
    async (
      _,
      payload: IpcGitIntegrationClonePayload,
    ): Promise<IpcGitIntegrationCloneResponse> => {
      try {
        await cqrsDispatcher.dispatchCommand(
          new CloneRepositoryCommand(payload.repoUrl, payload.localPath),
        );
        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );

  ipcMain.handle(
    IpcChannel.GIT_INTEGRATION_INITIALIZE,
    async (
      _,
      payload: IpcGitIntegrationInitializePayload,
    ): Promise<IpcGitIntegrationInitializeResponse> => {
      try {
        await cqrsDispatcher.dispatchCommand(new InitializeRepositoryCommand());
        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );

  ipcMain.handle(
    IpcChannel.GIT_INTEGRATION_PULL,
    async (
      _,
      payload: IpcGitIntegrationPullPayload,
    ): Promise<IpcGitIntegrationPullResponse> => {
      try {
        await cqrsDispatcher.dispatchCommand(new PullRepositoryCommand());
        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );
}
