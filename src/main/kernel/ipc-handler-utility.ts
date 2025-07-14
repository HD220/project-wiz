import { ipcMain, IpcMainInvokeEvent } from "electron";
import { logger } from "../logger";

export type IpcHandler<TRequest = unknown, TResponse = unknown> = (
  event: IpcMainInvokeEvent,
  request: TRequest,
) => Promise<TResponse> | TResponse;

/**
 * Creates an IPC handler with standardized error handling and logging
 */
export function createIpcHandler<TRequest = unknown, TResponse = unknown>(
  channel: string,
  handler: IpcHandler<TRequest, TResponse>,
): void {
  // eslint-disable-next-line no-restricted-syntax
  ipcMain.handle(
    channel,
    async (event: IpcMainInvokeEvent, request: TRequest) => {
      const startTime = Date.now();

      try {
        logger.debug(`IPC call started: ${channel}`, { request });

        const result = await handler(event, request);

        const duration = Date.now() - startTime;
        logger.debug(`IPC call completed: ${channel}`, {
          duration: `${duration}ms`,
          success: true,
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`IPC call failed: ${channel}`, {
          error: error instanceof Error ? error.message : String(error),
          duration: `${duration}ms`,
          request,
        });

        // Re-throw the error to be handled by the renderer
        throw error;
      }
    },
  );
}

/**
 * Creates a simple IPC handler for synchronous operations
 */
export function createSimpleIpcHandler<TResponse = unknown>(
  channel: string,
  handler: () => TResponse,
): void {
  createIpcHandler(channel, () => handler());
}
