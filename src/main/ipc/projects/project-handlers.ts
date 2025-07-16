import { ipcMain } from "electron";

import {
  createProject,
  findProjectById,
  findAllProjects,
  updateProject,
  deleteProject,
  archiveProject,
  projectToDto,
} from "../../domains/projects/functions";

export function registerProjectHandlers(): void {
  ipcMain.handle("project:create", async (_, data) => {
    const project = await createProject(data);
    return projectToDto(project);
  });

  ipcMain.handle("project:getById", async (_, data) => {
    const project = await findProjectById(data.id);
    return project ? projectToDto(project) : null;
  });

  ipcMain.handle("project:list", async (_, filter) => {
    const projects = await findAllProjects(filter);
    return projects.map(projectToDto);
  });

  ipcMain.handle("project:update", async (_, data) => {
    const project = await updateProject(data);
    return projectToDto(project);
  });

  ipcMain.handle("project:delete", async (_, data) => {
    await deleteProject(data.id);
  });

  ipcMain.handle("project:archive", async (_, data) => {
    const project = await archiveProject(data.id);
    return projectToDto(project);
  });
}
