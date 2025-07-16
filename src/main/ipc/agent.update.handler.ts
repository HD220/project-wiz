import { ipcMain } from "electron";

import {
  updateAgent,
  deleteAgent,
  activateAgent,
  deactivateAgent,
  setDefaultAgent,
  agentToDto,
} from "../domains/agents/functions";

export function registerAgentUpdateHandlers(): void {
  ipcMain.handle("agent:update", async (_, data) => {
    const agent = await updateAgent(data.id, data);
    return agentToDto(agent);
  });

  ipcMain.handle("agent:delete", async (_, data) => {
    await deleteAgent(data.id);
  });

  ipcMain.handle("agent:activate", async (_, data) => {
    await activateAgent(data.id);
  });

  ipcMain.handle("agent:deactivate", async (_, data) => {
    await deactivateAgent(data.id);
  });

  ipcMain.handle("agent:setDefault", async (_, data) => {
    await setDefaultAgent(data.id);
  });
}
