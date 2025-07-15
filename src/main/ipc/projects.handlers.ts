import { ipcMain } from "electron";

import {
  createProject,
  findProjectById,
  findAllProjects,
  updateProject,
  deleteProject,
  archiveProject,
  projectToDto,
  // Channel functions
  createChannel,
  findChannelById,
  findChannelsByProject,
  findAccessibleChannels,
  createGeneralChannel,
  deleteChannel,
  // Project message functions
  createProjectMessage,
  findMessageById,
  findMessagesByChannel,
  findMessagesByAuthor,
  deleteMessage,
} from "../domains/projects/functions";

export function registerProjectHandlers(): void {
  // Project handlers
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

export function registerChannelHandlers(): void {
  // Channel handlers (communication module)
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

export function registerChannelMessageHandlers(): void {
  // Channel message handlers (channel-messaging module)
  ipcMain.handle("channelMessage:create", async (_, data) => {
    return await createProjectMessage(data);
  });

  ipcMain.handle("channelMessage:getById", async (_, data) => {
    return await findMessageById(data.id);
  });

  ipcMain.handle("channelMessage:listByChannel", async (_, data) => {
    const limit = data.limit || 50;
    return await findMessagesByChannel(data.channelId, limit);
  });

  ipcMain.handle("channelMessage:listByAuthor", async (_, data) => {
    return await findMessagesByAuthor(data.authorId, data.channelId);
  });

  ipcMain.handle("channelMessage:delete", async (_, data) => {
    await deleteMessage(data.id, data.userId);
  });

  ipcMain.handle("channelMessage:createText", async (_, data) => {
    return await createProjectMessage({
      content: data.content,
      channelId: data.channelId,
      authorId: data.authorId,
      authorName: data.authorName,
      type: "text",
    });
  });

  ipcMain.handle("channelMessage:createCode", async (_, data) => {
    return await createProjectMessage({
      content: data.content,
      channelId: data.channelId,
      authorId: data.authorId,
      authorName: data.authorName,
      type: "code",
      metadata: data.metadata,
    });
  });

  ipcMain.handle("channelMessage:createSystem", async (_, data) => {
    return await createProjectMessage({
      content: data.content,
      channelId: data.channelId,
      authorId: "system",
      authorName: "System",
      type: "system",
      metadata: data.metadata,
    });
  });
}
