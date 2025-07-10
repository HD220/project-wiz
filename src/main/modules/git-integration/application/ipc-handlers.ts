import { ipcMain } from "electron";
import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import {
  IpcGitIntegrationClonePayload,
  IpcGitIntegrationCloneResponse,
  IpcGitIntegrationInitializePayload,
  IpcGitIntegrationInitializeResponse,
  IpcGitIntegrationPullPayload,
  IpcGitIntegrationPullResponse,
} from "@/shared/ipc-types/entities";
import { CloneRepositoryCommand } from "../application/commands/clone-repository.command";
import { InitializeRepositoryCommand } from "../application/commands/initialize-repository.command";
import { PullRepositoryCommand } from "../application/commands/pull-repository.command";

export function registerGitIntegrationHandlers(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    "git-integration:clone",
    async (
      _,
      payload: IpcGitIntegrationClonePayload,
    ): Promise<IpcGitIntegrationCloneResponse> => {
      try {
        await cqrsDispatcher.dispatchCommand(
          new CloneRepositoryCommand(payload),
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
    "git-integration:initialize",
    async (
      _,
      payload: IpcGitIntegrationInitializePayload,
    ): Promise<IpcGitIntegrationInitializeResponse> => {
      try {
        await cqrsDispatcher.dispatchCommand(
          new InitializeRepositoryCommand(payload),
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
    "git-integration:pull",
    async (
      _,
      payload: IpcGitIntegrationPullPayload,
    ): Promise<IpcGitIntegrationPullResponse> => {
      try {
        await cqrsDispatcher.dispatchCommand(
          new PullRepositoryCommand(payload),
        );
        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );
}
