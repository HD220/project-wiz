import { IpcMainInvokeEvent } from "electron";

export type IpcHandler<TRequest = unknown, TResponse = unknown> = (
  event: IpcMainInvokeEvent,
  request: TRequest,
) => Promise<TResponse> | TResponse;
