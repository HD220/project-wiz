import { ipcMain } from "electron";
import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import {
  IpcFilesystemListDirectoryPayload,
  IpcFilesystemListDirectoryResponse,
  IpcFilesystemReadFilePayload,
  IpcFilesystemReadFileResponse,
  IpcFilesystemSearchFileContentPayload,
  IpcFilesystemSearchFileContentResponse,
  IpcFilesystemWriteFilePayload,
  IpcFilesystemWriteFileResponse,
} from "@/shared/ipc-types/ipc-payloads";
import { ListDirectoryQuery } from "../application/queries/list-directory.query";
import { ReadFileQuery } from "../application/queries/read-file.query";
import { SearchFileContentQuery } from "../application/queries/search-file-content.query";
import { WriteFileCommand } from "../application/commands/write-file.command";

export function registerFilesystemHandlers(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    IpcChannel.FILESYSTEM_LIST_DIRECTORY,
    async (
      _,
      payload: IpcFilesystemListDirectoryPayload,
    ): Promise<IpcFilesystemListDirectoryResponse> => {
      try {
        const entries = (await cqrsDispatcher.dispatchQuery(
          new ListDirectoryQuery(payload.path),
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
    IpcChannel.FILESYSTEM_READ_FILE,
    async (
      _,
      payload: IpcFilesystemReadFilePayload,
    ): Promise<IpcFilesystemReadFileResponse> => {
      try {
        const content = (await cqrsDispatcher.dispatchQuery(
          new ReadFileQuery(payload.absolutePath),
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
    IpcChannel.FILESYSTEM_SEARCH_FILE_CONTENT,
    async (
      _,
      payload: IpcFilesystemSearchFileContentPayload,
    ): Promise<IpcFilesystemSearchFileContentResponse> => {
      try {
        const matches = (await cqrsDispatcher.dispatchQuery(
          new SearchFileContentQuery(payload.path!, payload.pattern!),
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
    IpcChannel.FILESYSTEM_WRITE_FILE,
    async (
      _,
      payload: IpcFilesystemWriteFilePayload,
    ): Promise<IpcFilesystemWriteFileResponse> => {
      try {
        await cqrsDispatcher.dispatchCommand(
          new WriteFileCommand(payload.content, payload.filePath),
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
