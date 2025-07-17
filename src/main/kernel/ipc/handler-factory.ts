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

export interface CrudOperations<T> {
  create?: (data: unknown) => Promise<T>;
  findById?: (id: string) => Promise<T | null>;
  findAll?: () => Promise<T[]>;
  update?: (id: string, data: unknown) => Promise<T>;
  delete?: (id: string) => Promise<void>;
}

export interface CustomOperations<T> {
  [key: string]: (data: unknown) => Promise<T | T[] | void>;
}

export function createCrudHandlers<T>(
  domain: string,
  operations: CrudOperations<T>,
  customOperations: CustomOperations<T> = {},
): void {
  const toDto = (entity: T): unknown => {
    if (entity && typeof entity === "object" && "toData" in entity) {
      return (entity as { toData(): unknown }).toData();
    }
    return entity;
  };

  // CRUD operations
  if (operations.create) {
    createIpcHandler(`${domain}:create`, async (_, data) => {
      const result = await operations.create!(data);
      return toDto(result);
    });
  }

  if (operations.findById) {
    createIpcHandler(`${domain}:getById`, async (_, data) => {
      const result = await operations.findById!((data as { id: string }).id);
      return result ? toDto(result) : null;
    });
  }

  if (operations.findAll) {
    createIpcHandler(`${domain}:list`, async () => {
      const results = await operations.findAll!();
      return results.map(toDto);
    });
  }

  if (operations.update) {
    createIpcHandler(`${domain}:update`, async (_, data) => {
      const { id, ...updateData } = data as { id: string };
      const result = await operations.update!(id, updateData);
      return toDto(result);
    });
  }

  if (operations.delete) {
    createIpcHandler(`${domain}:delete`, async (_, data) => {
      await operations.delete!((data as { id: string }).id);
    });
  }

  // Custom operations
  Object.entries(customOperations).forEach(([operation, handler]) => {
    createIpcHandler(`${domain}:${operation}`, async (_, data) => {
      const result = await handler(data);
      if (Array.isArray(result)) {
        return result.map(toDto);
      }
      return result ? toDto(result) : result;
    });
  });
}
