import { ipcMain } from "electron";
import {
  createChannel,
  findChannelById,
  findChannelsByProject,
  updateChannel,
  deleteChannel,
} from "./channel.service";

export function registerChannelHandlers(): void {
  ipcMain.handle("channel:create", async (_, data) => {
    const userId = data.userId || "temp-user-id";
    return await createChannel(data, userId);
  });

  ipcMain.handle("channel:getById", async (_, data) => {
    return await findChannelById(data.id);
  });

  ipcMain.handle("channel:listByProject", async (_, data) => {
    return await findChannelsByProject(data.projectId);
  });

  ipcMain.handle("channel:update", async (_, data) => {
    return await updateChannel(data.id, data);
  });

  ipcMain.handle("channel:delete", async (_, data) => {
    await deleteChannel(data.id);
  });
}
