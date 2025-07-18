import { ipcMain } from "electron";
import {
  createForumTopic,
  findForumTopicById,
  findForumTopicsByProject,
  updateForumTopic,
  deleteForumTopic,
  createForumPost,
  findForumPostsByTopic,
  updateForumPost,
  deleteForumPost,
  incrementTopicViewCount,
} from "./forum.service";
import { requireUserId } from "../../utils/auth-utils";

export function registerForumHandlers(): void {
  // Topic handlers
  ipcMain.handle("forum:createTopic", async (_, data) => {
    const userId = requireUserId(data);
    return await createForumTopic(data, userId);
  });

  ipcMain.handle("forum:getTopicById", async (_, data) => {
    return await findForumTopicById(data.id);
  });

  ipcMain.handle("forum:listTopicsByProject", async (_, data) => {
    return await findForumTopicsByProject(data.projectId, data.filters);
  });

  ipcMain.handle("forum:updateTopic", async (_, data) => {
    return await updateForumTopic(data.id, data);
  });

  ipcMain.handle("forum:deleteTopic", async (_, data) => {
    await deleteForumTopic(data.id);
  });

  ipcMain.handle("forum:incrementTopicViews", async (_, data) => {
    await incrementTopicViewCount(data.topicId);
  });

  // Post handlers
  ipcMain.handle("forum:createPost", async (_, data) => {
    const userId = requireUserId(data);
    return await createForumPost(data, userId);
  });

  ipcMain.handle("forum:getPostsByTopic", async (_, data) => {
    return await findForumPostsByTopic(data.topicId, data.options);
  });

  ipcMain.handle("forum:updatePost", async (_, data) => {
    return await updateForumPost(data.id, data);
  });

  ipcMain.handle("forum:deletePost", async (_, data) => {
    await deleteForumPost(data.id);
  });
}
