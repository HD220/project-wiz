import { ipcMain } from "electron";

import {
  createChannel,
  findChannelById,
  deleteChannel,
} from "../../domains/projects/functions/channel-crud.functions";
import {
  findChannelsByProject,
  findAccessibleChannels,
  createGeneralChannel,
} from "../../domains/projects/functions/channel-operations.functions";

export function registerChannelHandlers(): void {
  ipcMain.handle("channel:create", async (_, data) => {
    return await createChannel(data);
  });

  ipcMain.handle("channel:getById", async (_, data) => {
    return await findChannelById(data.id);
  });

  ipcMain.handle("channel:listByProject", async (_, data) => {
    return await findChannelsByProject(data.projectId);
  });

  ipcMain.handle("channel:listAccessible", async (_, data) => {
    return await findAccessibleChannels(data.projectId, data.userId);
  });

  ipcMain.handle("channel:createGeneral", async (_, data) => {
    return await createGeneralChannel(data.projectId, data.createdBy);
  });

  ipcMain.handle("channel:delete", async (_, data) => {
    await deleteChannel(data.id);
  });
}
