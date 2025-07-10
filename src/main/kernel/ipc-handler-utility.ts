import { ipcMain } from 'electron';
import type { CqrsDispatcher } from '@kernel/cqrs-dispatcher';
import type { IpcChannels } from '@shared/ipc-types/ipc-channels';
import type { IpcResponse } from '@shared/ipc-types/ipc-contracts';
import { ApplicationError } from '@/main/errors/application.error';
import { DomainError } from '@/main/errors/domain.error';
import { NotFoundError } from '@/main/errors/not-found.error';
import { ValidationError } from '@/main/errors/validation.error';

export function createIpcHandler<TPayload, TResult>(
  channel: IpcChannels,
  cqrsDispatcher: CqrsDispatcher,
  handlerFn: (payload: TPayload) => Promise<TResult>,
): void {
  ipcMain.handle(channel, async (_, payload: TPayload): Promise<IpcResponse<TResult>> => {
    try {
      const result = await handlerFn(payload);
      return { success: true, data: result };
    } catch (error: unknown) {
      let errorMessage: string;

      if (error instanceof ApplicationError || error instanceof DomainError || error instanceof NotFoundError || error instanceof ValidationError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'An unknown error occurred';
      }
      return { success: false, error: { message: errorMessage } };
    }
  });
}
