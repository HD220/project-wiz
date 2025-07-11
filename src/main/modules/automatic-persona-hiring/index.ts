import type { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { createIpcHandler } from "@/main/kernel/ipc-handler-utility";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import type {
  IpcAutomaticPersonaHiringHirePayload,
} from "@/shared/ipc-types/ipc-payloads";
import { HirePersonasAutomaticallyCommand, HirePersonasAutomaticallyCommandHandler } from "./application/commands/hire-personas-automatically.command";

export function registerAutomaticPersonaHiringModule(
  cqrsDispatcher: CqrsDispatcher,
  logger: any,
) {
  const hirePersonasAutomaticallyCommandHandler = new HirePersonasAutomaticallyCommandHandler(cqrsDispatcher);

  cqrsDispatcher.registerCommandHandler<HirePersonasAutomaticallyCommand, boolean>(
    HirePersonasAutomaticallyCommand.name,
    hirePersonasAutomaticallyCommandHandler.handle.bind(hirePersonasAutomaticallyCommandHandler),
  );

  createIpcHandler<IpcAutomaticPersonaHiringHirePayload, boolean>(
    IpcChannel.AUTOMATIC_PERSONA_HIRING_HIRE,
    cqrsDispatcher,
    async (payload) => {
      return (await cqrsDispatcher.dispatchCommand(
        new HirePersonasAutomaticallyCommand(payload),
      )) as boolean;
    },
  );
}
