import { ipcMain } from "electron";

import {
  createProject,
  findProjectById,
  findAllProjects,
  updateProject,
  deleteProject,
  archiveProject,
} from "../../domains/projects/project.functions";

export function registerProjectHandlers(): void {
  ipcMain.handle("project:create", async (_, data) => {
    const project = await createProject(data);
    return project.toData();
  });

  ipcMain.handle("project:getById", async (_, data) => {
    const project = await findProjectById(data.id);
    return project ? project.toData() : null;
  });

  ipcMain.handle("project:list", async (_) => {
    const projects = await findAllProjects();
    return projects.map((project) => project.toData());
  });

  ipcMain.handle("project:update", async (_, data) => {
    const project = await updateProject(data.id, data);
    return project.toData();
  });

  ipcMain.handle("project:delete", async (_, data) => {
    await deleteProject(data.id);
  });

  ipcMain.handle("project:archive", async (_, data) => {
    const project = await archiveProject(data.id);
    return project.toData();
  });
}
