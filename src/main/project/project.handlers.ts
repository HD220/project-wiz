import { ipcMain } from "electron";
import {
  createProject,
  findProjectById,
  findProjectsByUser,
  updateProject,
  deleteProject,
  archiveProject,
} from "./project.service";
import { requireUserId } from "../utils/auth-utils";

export function registerProjectHandlers(): void {
  ipcMain.handle("project:create", async (_, data) => {
    const userId = requireUserId(data);
    return await createProject(data, userId);
  });

  ipcMain.handle("project:getById", async (_, data) => {
    return await findProjectById(data.id);
  });

  ipcMain.handle("project:list", async (_, data) => {
    const userId = requireUserId(data);
    return await findProjectsByUser(userId);
  });

  ipcMain.handle("project:update", async (_, data) => {
    const userId = requireUserId(data);
    return await updateProject(data.id, data, userId);
  });

  ipcMain.handle("project:delete", async (_, data) => {
    const userId = requireUserId(data);
    await deleteProject(data.id, userId);
  });

  ipcMain.handle("project:archive", async (_, data) => {
    const userId = requireUserId(data);
    return await archiveProject(data.id, userId);
  });
}
