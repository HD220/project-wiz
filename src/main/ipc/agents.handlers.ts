import { ipcMain } from "electron";

import {
  createAgent,
  findAgentById,
  findAgentByName,
  findAllAgents,
  findDefaultAgent,
  updateAgent,
  deleteAgent,
  activateAgent,
  deactivateAgent,
  setDefaultAgent,
  agentToDto,
} from "../domains/agents/functions";

export function registerAgentHandlers(): void {
  // Create operations
  ipcMain.handle("agent:create", async (_, data) => {
    const result = await createAgent(data);
    const agent = await findAgentById(result.id);
    return agent ? agentToDto(agent) : null;
  });

  // Read operations
  ipcMain.handle("agent:getById", async (_, data) => {
    const agent = await findAgentById(data.id);
    return agent ? agentToDto(agent) : null;
  });

  ipcMain.handle("agent:getByName", async (_, data) => {
    const agent = await findAgentByName(data.name);
    return agent ? agentToDto(agent) : null;
  });

  ipcMain.handle("agent:list", async (_, filter) => {
    const agents = await findAllAgents(filter);
    return agents.map(agentToDto);
  });

  ipcMain.handle("agent:listActive", async (_) => {
    const agents = await findAllAgents({ isActive: true });
    return agents.map(agentToDto);
  });

  ipcMain.handle("agent:getDefault", async (_) => {
    const agent = await findDefaultAgent();
    return agent ? agentToDto(agent) : null;
  });

  // Update operations
  ipcMain.handle("agent:update", async (_, data) => {
    const agent = await updateAgent(data.id, data);
    return agentToDto(agent);
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

  // Delete operations
  ipcMain.handle("agent:delete", async (_, data) => {
    await deleteAgent(data.id);
  });
}
