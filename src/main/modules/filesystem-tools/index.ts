import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { registerFilesystemHandlers } from "./application/ipc-handlers";

export function registerFilesystemToolsModule(cqrsDispatcher: CqrsDispatcher) {
  registerFilesystemHandlers(cqrsDispatcher);
}
