import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { createIpcHandler } from "@/main/kernel/ipc-handler-utility";

export function registerAutomaticPersonaHiringIpcHandlers(cqrsDispatcher: CqrsDispatcher): void {
  createIpcHandler(
    IpcChannel.AUTOMATIC_PERSONA_HIRING_HIRE,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("Hire persona payload:", payload);
      return { success: true };
    },
  );
}
