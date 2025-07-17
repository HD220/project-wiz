import { ipcMain } from "electron";

import {
  createAgent,
  findAgentById,
  findAllAgents,
  updateAgent,
  deleteAgent,
  activateAgent,
  deactivateAgent,
} from "../domains/agents/agent.functions";

export function registerAgentHandlers(): void {
  // Create operations
  ipcMain.handle("agent:create", async (_, data) => {
    const agent = await createAgent(data);
    return agent.toData();
  });

  // Read operations
  ipcMain.handle("agent:getById", async (_, data) => {
    const agent = await findAgentById(data.id);
    return agent ? agent.toData() : null;
  });

  ipcMain.handle("agent:list", async (_) => {
    const agents = await findAllAgents();
    return agents.map((agent) => agent.toData());
  });

  ipcMain.handle("agent:listActive", async (_) => {
    const agents = await findAllAgents();
    return agents
      .filter((agent) => agent.getStatus() === "active")
      .map((agent) => agent.toData());
  });

  // Update operations
  ipcMain.handle("agent:update", async (_, data) => {
    const agent = await updateAgent(data.id, data);
    return agent.toData();
  });

  ipcMain.handle("agent:activate", async (_, data) => {
    const agent = await activateAgent(data.id);
    return agent.toData();
  });

  ipcMain.handle("agent:deactivate", async (_, data) => {
    const agent = await deactivateAgent(data.id);
    return agent.toData();
  });

  // Delete operations
  ipcMain.handle("agent:delete", async (_, data) => {
    await deleteAgent(data.id);
  });
}
