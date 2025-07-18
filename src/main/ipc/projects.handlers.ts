import { registerChannelHandlers } from "./projects/channel-handlers";
import { registerMessageHandlers } from "./projects/message-handlers";
import { registerProjectHandlers } from "./projects/project-handlers";

export function registerProjectsHandlers(): void {
  registerProjectHandlers();
  registerChannelHandlers();
  registerMessageHandlers();
}
