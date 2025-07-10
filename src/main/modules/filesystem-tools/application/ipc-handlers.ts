import { ipcMain } from "electron";
import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import {
  IpcFilesystemListDirectoryPayload,
  IpcFilesystemListDirectoryResponse,
  IpcFilesystemReadFilePayload,
  IpcFilesystemReadFileResponse,
  IpcFilesystemSearchFileContentPayload,
  IpcFilesystemSearchFileContentResponse,
  IpcFilesystemWriteFilePayload,
  IpcFilesystemWriteFileResponse,
} from "@/shared/ipc-types/entities";
import { ListDirectoryQuery } from "../application/queries/list-directory.query";
import { ReadFileQuery } from "../application/queries/read-file.query";
import { SearchFileContentQuery } from "../application/queries/search-file-content.query";
import { WriteFileCommand } from "../application/commands/write-file.command";

export function registerFilesystemHandlers(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    "filesystem:list-directory",
    async (
      _,
      payload: IpcFilesystemListDirectoryPayload,
    ): Promise<IpcFilesystemListDirectoryResponse> => {
      try {
        const entries = (await cqrsDispatcher.dispatchQuery(
          new ListDirectoryQuery(payload),
        )) as string[];
        return { success: true, data: entries };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );

  ipcMain.handle(
    "filesystem:read-file",
    async (
      _,
      payload: IpcFilesystemReadFilePayload,
    ): Promise<IpcFilesystemReadFileResponse> => {
      try {
        const content = (await cqrsDispatcher.dispatchQuery(
          new ReadFileQuery(payload),
        )) as string;
        return { success: true, data: content };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );

  ipcMain.handle(
    "filesystem:search-file-content",
    async (
      _,
      payload: IpcFilesystemSearchFileContentPayload,
    ): Promise<IpcFilesystemSearchFileContentResponse> => {
      try {
        const matches = (await cqrsDispatcher.dispatchQuery(
          new SearchFileContentQuery(payload),
        )) as string[];
        return { success: true, data: matches };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );

  ipcMain.handle(
    "filesystem:write-file",
    async (
      _,
      payload: IpcFilesystemWriteFilePayload,
    ): Promise<IpcFilesystemWriteFileResponse> => {
      try {
        await cqrsDispatcher.dispatchCommand(new WriteFileCommand(payload));
        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );
}
