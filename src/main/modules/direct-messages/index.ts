import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { ipcMain } from "electron";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import { IDirectMessage } from "@/shared/ipc-types/domain-types";
import {
  IpcDirectMessagesListResponse,
  IpcDirectMessagesSendPayload,
  IpcDirectMessagesSendResponse,
  IpcDirectMessagesListPayload,
} from "@/shared/ipc-types/ipc-payloads";
import { SendMessageCommand } from "./application/commands/send-message.command";
import { ListMessagesQuery } from "./application/queries/list-messages.query";

export function registerDirectMessagesModule(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    IpcChannel.DIRECT_MESSAGES_SEND,
    async (
      _,
      payload: IpcDirectMessagesSendPayload,
    ): Promise<IpcDirectMessagesSendResponse> => {
      try {
        const message = (await cqrsDispatcher.dispatchCommand(
          new SendMessageCommand(payload),
        )) as IDirectMessage;
        return { success: true, data: message };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );

  ipcMain.handle(
    IpcChannel.DIRECT_MESSAGES_LIST,
    async (
      _,
      payload: IpcDirectMessagesListPayload,
    ): Promise<IpcDirectMessagesListResponse> => {
      try {
        const messages = (await cqrsDispatcher.dispatchQuery(
          new ListMessagesQuery(payload),
        )) as IDirectMessage[];
        return { success: true, data: messages };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );
}
