import { ipcMain } from "electron";

import {
  createAgent,
  findAgentById,
  findAgentByName,
  findAllAgents,
  updateAgent,
  deleteAgent,
  activateAgent,
  deactivateAgent,
  setDefaultAgent,
  findDefaultAgent,
  agentToDto,
} from "../domains/agents/functions";

export function registerAgentHandlers(): void {
  ipcMain.handle("agent:create", async (_, data) => {
    const agent = await createAgent(data);
    return agentToDto(agent);
  });

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

  ipcMain.handle("agent:getDefault", async (_) => {
    const agent = await findDefaultAgent();
    return agent ? agentToDto(agent) : null;
  });
}
