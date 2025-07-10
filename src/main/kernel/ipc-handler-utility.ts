import { ipcMain } from "electron";
import { CqrsDispatcher, ICommand, IQuery } from "@/main/kernel/cqrs-dispatcher";
import { IpcContracts } from "@/shared/ipc-types/ipc-contracts";
import { IpcResponse } from "@/shared/ipc-types/ipc-payloads";

export function createIpcHandler<Channel extends keyof IpcContracts>(
  channel: Channel,
  cqrsDispatcher: CqrsDispatcher,
  commandOrQueryFactory: (
    payload: IpcContracts[Channel]["request"],
  ) => ICommand<any> | IQuery<any>,
): void {
  ipcMain.handle(
    channel,
    async (
      _,
      payload: IpcContracts[Channel]["request"],
    ): Promise<IpcContracts[Channel]["response"]> => {
      try {
        const instance = commandOrQueryFactory(payload);
        let result: any;

        if (instance.type.endsWith("Command")) {
          result = await cqrsDispatcher.dispatchCommand(instance as ICommand<any>);
        } else if (instance.type.endsWith("Query")) {
          result = await cqrsDispatcher.dispatchQuery(instance as IQuery<any>);
        } else {
          throw new Error("Invalid command or query type.");
        }

        return { success: true, data: result } as IpcContracts[Channel]["response"];
      } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } } as IpcContracts[Channel]["response"];
      }
    },
  );
}
