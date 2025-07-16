import { ipcMain, IpcMainInvokeEvent } from "electron";

import { logIpcStart, logIpcSuccess, logIpcError } from "./logger";
import { IpcHandler } from "./types";

export function createIpcHandler<TRequest = unknown, TResponse = unknown>(
  channel: string,
  handler: IpcHandler<TRequest, TResponse>,
): void {
  ipcMain.handle(
    channel,
    async (event: IpcMainInvokeEvent, request: TRequest) => {
      const startTime = Date.now();

      try {
        logIpcStart(channel, request);

        const result = await handler(event, request);

        const duration = Date.now() - startTime;
        logIpcSuccess(channel, duration);

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logIpcError(channel, error, duration, request);

        throw error;
      }
    },
  );
}

export function createSimpleIpcHandler<TResponse = unknown>(
  channel: string,
  handler: () => TResponse,
): void {
  createIpcHandler(channel, () => handler());
}
