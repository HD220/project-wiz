import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { ipcMain } from "electron";
import {
  IpcAutomaticPersonaHiringHirePayload,
  IpcAutomaticPersonaHiringHireResponse,
} from "@/shared/ipc-types/entities";
import { HirePersonasAutomaticallyCommand } from "./application/commands/hire-personas-automatically.command";

export function registerAutomaticPersonaHiringModule(
  cqrsDispatcher: CqrsDispatcher,
) {
  ipcMain.handle(
    "automatic-persona-hiring:hire",
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
