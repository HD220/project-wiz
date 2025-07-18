import { ipcMain } from "electron";

import {
  findChannelById,
  deleteChannel,
} from "../../domains/projects/functions/channel-crud.functions";
import {
  findChannelsByProject,
  findAccessibleChannels,
  createGeneralChannel,
  createChannelForProject,
} from "../../domains/projects/functions/channel-operations.functions";

export function registerChannelHandlers(): void {
  // Criar canal através do projeto (subdomínio)
  ipcMain.handle("project:createChannel", async (_, data) => {
    return await createChannelForProject(data.projectId, {
      name: data.name,
      description: data.description,
    });
  });

  ipcMain.handle("project:createGeneralChannel", async (_, data) => {
    return await createGeneralChannel(data.projectId);
  });

  // Operações específicas de canal
  ipcMain.handle("channel:getById", async (_, data) => {
    return await findChannelById(data.id);
  });

  ipcMain.handle("project:listChannels", async (_, data) => {
    return await findChannelsByProject(data.projectId);
  });

  ipcMain.handle("project:listAccessibleChannels", async (_, data) => {
    return await findAccessibleChannels(data.projectId);
  });

  ipcMain.handle("channel:delete", async (_, data) => {
    await deleteChannel(data.id);
  });
}
