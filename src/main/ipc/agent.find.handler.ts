import { ipcMain } from "electron";

import {
  findAgentById,
  findAgentByName,
  findAllAgents,
  findDefaultAgent,
  agentToDto,
} from "../domains/agents/functions";

export function registerAgentFindHandlers(): void {
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
}
