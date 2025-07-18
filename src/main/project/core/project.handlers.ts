import { ipcMain } from "electron";
import {
  createProject,
  findProjectById,
  findProjectsByUser,
  updateProject,
  deleteProject,
  archiveProject,
} from "./project.service";

export function registerProjectHandlers(): void {
  ipcMain.handle("project:create", async (_, data) => {
    const userId = data.userId || "temp-user-id";
    return await createProject(data, userId);
  });

  ipcMain.handle("project:getById", async (_, data) => {
    return await findProjectById(data.id);
  });

  ipcMain.handle("project:list", async (_, data) => {
    const userId = data.userId || "temp-user-id";
    return await findProjectsByUser(userId);
  });

  ipcMain.handle("project:update", async (_, data) => {
    const userId = data.userId || "temp-user-id";
    return await updateProject(data.id, data, userId);
  });

  ipcMain.handle("project:delete", async (_, data) => {
    const userId = data.userId || "temp-user-id";
    await deleteProject(data.id, userId);
  });

  ipcMain.handle("project:archive", async (_, data) => {
    const userId = data.userId || "temp-user-id";
    return await archiveProject(data.id, userId);
  });
}
