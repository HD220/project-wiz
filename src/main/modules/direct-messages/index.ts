import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { ipcMain } from "electron";
import {
  IDirectMessage,
  IpcDirectMessagesListResponse,
  IpcDirectMessagesSendPayload,
  IpcDirectMessagesSendResponse,
} from "@/shared/ipc-types/entities";
import { SendMessageCommand } from "./application/commands/send-message.command";
import { ListMessagesQuery } from "./application/queries/list-messages.query";

export function registerDirectMessagesModule(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    "direct-messages:send",
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
    "direct-messages:list",
    async (
      _,
      payload: { senderId: string; receiverId: string },
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
