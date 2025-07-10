import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import {
  HirePersonasAutomaticallyCommand,
  HirePersonasAutomaticallyCommandHandler,
} from "@/main/modules/automatic-persona-hiring/application/commands/hire-personas-automatically.command";

function registerAutomaticPersonaHiringHandlers(
  cqrsDispatcher: CqrsDispatcher,
  hirePersonasAutomaticallyCommandHandler: HirePersonasAutomaticallyCommandHandler,
) {
  cqrsDispatcher.registerCommandHandler<
    HirePersonasAutomaticallyCommand,
    boolean
  >(
    "HirePersonasAutomaticallyCommand",
    hirePersonasAutomaticallyCommandHandler.handle.bind(
      hirePersonasAutomaticallyCommandHandler,
    ),
  );
}

export function initializeAutomaticPersonaHiring(cqrsDispatcher: CqrsDispatcher) {
  const hirePersonasAutomaticallyCommandHandler =
    new HirePersonasAutomaticallyCommandHandler(cqrsDispatcher);

  registerAutomaticPersonaHiringHandlers(
    cqrsDispatcher,
    hirePersonasAutomaticallyCommandHandler,
  );
}
