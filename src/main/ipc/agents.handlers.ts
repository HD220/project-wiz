import { registerAgentCreateHandler } from "./agent.create.handler";
import { registerAgentFindHandlers } from "./agent.find.handler";
import { registerAgentUpdateHandlers } from "./agent.update.handler";

export function registerAgentHandlers(): void {
  registerAgentCreateHandler();
  registerAgentFindHandlers();
  registerAgentUpdateHandlers();
}
