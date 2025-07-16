import { ipcMain } from "electron";

import { createAgent, agentToDto } from "../domains/agents/functions";

export function registerAgentCreateHandler(): void {
  ipcMain.handle("agent:create", async (_, data) => {
    const agent = await createAgent(data);
    return agentToDto(agent);
  });
}
