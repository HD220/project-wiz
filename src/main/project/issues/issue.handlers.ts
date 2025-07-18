import { ipcMain } from "electron";
import {
  createIssue,
  findIssueById,
  findIssuesByProject,
  updateIssue,
  deleteIssue,
  addIssueComment,
  getIssueComments,
  getIssueActivities,
} from "./issue.service";
import { requireUserId } from "../../utils/auth-utils";

export function registerIssueHandlers(): void {
  ipcMain.handle("issue:create", async (_, data) => {
    const userId = requireUserId(data);
    return await createIssue(data, userId);
  });

  ipcMain.handle("issue:getById", async (_, data) => {
    return await findIssueById(data.id);
  });

  ipcMain.handle("issue:listByProject", async (_, data) => {
    return await findIssuesByProject(data.projectId, data.filters);
  });

  ipcMain.handle("issue:update", async (_, data) => {
    const userId = requireUserId(data);
    return await updateIssue(data.id, data, userId);
  });

  ipcMain.handle("issue:delete", async (_, data) => {
    const userId = requireUserId(data);
    await deleteIssue(data.id, userId);
  });

  ipcMain.handle("issue:addComment", async (_, data) => {
    const userId = requireUserId(data);
    return await addIssueComment(data, userId);
  });

  ipcMain.handle("issue:getComments", async (_, data) => {
    return await getIssueComments(data.issueId);
  });

  ipcMain.handle("issue:getActivities", async (_, data) => {
    return await getIssueActivities(data.issueId);
  });
}
