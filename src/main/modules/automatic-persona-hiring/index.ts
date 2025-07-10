import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { ipcMain } from "electron";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import {
  IpcAutomaticPersonaHiringHirePayload,
  IpcAutomaticPersonaHiringHireResponse,
} from "@/shared/ipc-types/ipc-payloads";
import { HirePersonasAutomaticallyCommand } from "./application/commands/hire-personas-automatically.command";

export function registerAutomaticPersonaHiringModule(
  cqrsDispatcher: CqrsDispatcher,
) {
  ipcMain.handle(
    IpcChannel.AUTOMATIC_PERSONA_HIRING_HIRE,
    async (
      _,
      payload: IpcAutomaticPersonaHiringHirePayload,
    ): Promise<IpcAutomaticPersonaHiringHireResponse> => {
      try {
        const result = (await cqrsDispatcher.dispatchCommand(
          new HirePersonasAutomaticallyCommand(payload),
        )) as boolean;
        return { success: true, data: result };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );
}
