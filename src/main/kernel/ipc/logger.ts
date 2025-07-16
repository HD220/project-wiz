import { logger } from "../../logger";

export function logIpcStart(channel: string, request: unknown): void {
  logger.debug(`IPC call started: ${channel}`, { request });
}

export function logIpcSuccess(channel: string, duration: number): void {
  logger.debug(`IPC call completed: ${channel}`, {
    duration: `${duration}ms`,
    success: true,
  });
}

export function logIpcError(
  channel: string,
  error: unknown,
  duration: number,
  request: unknown,
): void {
  logger.error(`IPC call failed: ${channel}`, {
    error: error instanceof Error ? error.message : String(error),
    duration: `${duration}ms`,
    request,
  });
}
