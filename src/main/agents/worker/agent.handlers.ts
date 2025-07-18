import { ipcMain } from "electron";
import {
  createAgent,
  findAgentById,
  findAgentsByUser,
  updateAgent,
  deleteAgent,
  updateAgentStatus,
  addAgentToProject,
  removeAgentFromProject,
  findAgentsByProject,
} from "./agent.service";

export function registerAgentHandlers(): void {
  ipcMain.handle("agent:create", async (_, data) => {
    const userId = data.userId || "temp-user-id";
    return await createAgent(data, userId);
  });

  ipcMain.handle("agent:getById", async (_, data) => {
    return await findAgentById(data.id);
  });

  ipcMain.handle("agent:list", async (_, data) => {
    const userId = data.userId || "temp-user-id";
    return await findAgentsByUser(userId);
  });

  ipcMain.handle("agent:listByProject", async (_, data) => {
    return await findAgentsByProject(data.projectId);
  });

  ipcMain.handle("agent:update", async (_, data) => {
    const userId = data.userId || "temp-user-id";
    return await updateAgent(data.id, data, userId);
  });

  ipcMain.handle("agent:delete", async (_, data) => {
    const userId = data.userId || "temp-user-id";
    await deleteAgent(data.id, userId);
  });

  ipcMain.handle("agent:updateStatus", async (_, data) => {
    const userId = data.userId || "temp-user-id";
    return await updateAgentStatus(data.id, data.status, userId);
  });

  ipcMain.handle("agent:addToProject", async (_, data) => {
    const userId = data.userId || "temp-user-id";
    return await addAgentToProject(
      data.agentId,
      data.projectId,
      data.role,
      userId,
    );
  });

  ipcMain.handle("agent:removeFromProject", async (_, data) => {
    return await removeAgentFromProject(data.agentId, data.projectId);
  });
}
