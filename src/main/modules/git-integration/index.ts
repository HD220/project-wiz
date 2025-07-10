import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { registerGitIntegrationHandlers } from "./application/ipc-handlers";

export function registerGitIntegrationModule(cqrsDispatcher: CqrsDispatcher) {
  registerGitIntegrationHandlers(cqrsDispatcher);
}
