import { ipcMain } from "electron";

import { IpcResponse } from "../types";

import { getLogger } from "./logger";

/**
 * Creates a type-safe IPC handler with automatic error handling and logging
 *
 * @param channel - IPC channel name (e.g., "agents:create")
 * @param handler - Service function to wrap
 * @returns Configured IPC handler with automatic try/catch and logging
 *
 * @example
 * ```typescript
 * // Automatic type inference: args = [string], return = void
 * createIpcHandler("agents:delete", (id: string) =>
 *   AgentService.delete(id)
 * );
 *
 * // Multiple arguments with perfect typing
 * createIpcHandler("agents:update", (id: string, updates: UpdateInput) =>
 *   AgentService.update(id, updates)
 * );
 * ```
 */
export function createIpcHandler<TArgs extends unknown[], TReturn>(
  channel: string,
  handler: (...args: TArgs) => Promise<TReturn>,
): void {
  const logger = getLogger("ipc");

  ipcMain.handle(
    channel,
    async (_, ...args: TArgs): Promise<IpcResponse<TReturn>> => {
      logger.debug(
        { channel, args: args.length > 0 ? args : undefined },
        "IPC call started",
      );

      try {
        const result = await handler(...args);
        logger.info(
          { channel, success: true },
          "IPC call completed successfully",
        );
        return { success: true, data: result };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : `${channel} failed`;

        logger.error(
          {
            channel,
            error: errorMessage,
            args: args.length > 0 ? args : undefined,
            stack: error instanceof Error ? error.stack : undefined,
          },
          "IPC call failed",
        );

        return { success: false, error: errorMessage };
      }
    },
  );
}

/**
 * Generic error handler for existing IPC handlers that need manual migration
 * Use this when you can't immediately switch to createIpcHandler
 *
 * @param channel - IPC channel name for logging context
 * @param error - The caught error
 * @param context - Additional context for debugging
 * @returns Standardized IpcResponse error object
 *
 * @example
 * ```typescript
 * ipcMain.handle("legacy:handler", async (_, input): Promise<IpcResponse<Result>> => {
 *   try {
 *     const result = await LegacyService.method(input);
 *     return { success: true, data: result };
 *   } catch (error) {
 *     return handleIpcError("legacy:handler", error, { input });
 *   }
 * });
 * ```
 */
export function handleIpcError(
  channel: string,
  error: unknown,
  context?: Record<string, unknown>,
): IpcResponse<never> {
  const logger = getLogger("ipc");
  const errorMessage =
    error instanceof Error ? error.message : `${channel} failed`;

  logger.error(channel, {
    error: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });

  return { success: false, error: errorMessage };
}
