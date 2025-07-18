import { ipcMain } from "electron";
import {
  sendMessage,
  getChannelMessages,
  getDMMessages,
  getOrCreateDMConversation,
  getUserDMConversations,
  markDMAsRead,
  updateMessage,
  deleteMessage,
} from "./message.service";
import { requireUserId } from "../../utils/auth-utils";

export function registerMessageHandlers(): void {
  ipcMain.handle("message:send", async (_, data) => {
    const senderId = requireUserId(data);
    return await sendMessage(data, senderId, data.senderType || "user");
  });

  ipcMain.handle("message:getChannelMessages", async (_, data) => {
    return await getChannelMessages(data.channelId, {
      limit: data.limit || 50,
      before: data.before,
    });
  });

  ipcMain.handle("message:getDMMessages", async (_, data) => {
    return await getDMMessages(data.conversationId, {
      limit: data.limit || 50,
      before: data.before,
    });
  });

  ipcMain.handle("message:getOrCreateDMConversation", async (_, data) => {
    return await getOrCreateDMConversation(data.userId, data.agentId);
  });

  ipcMain.handle("message:getUserDMConversations", async (_, data) => {
    return await getUserDMConversations(data.userId);
  });

  ipcMain.handle("message:markDMAsRead", async (_, data) => {
    return await markDMAsRead(data.conversationId, data.userId);
  });

  ipcMain.handle("message:update", async (_, data) => {
    const userId = requireUserId(data);
    return await updateMessage(data.id, data.content, userId);
  });

  ipcMain.handle("message:delete", async (_, data) => {
    const userId = requireUserId(data);
    await deleteMessage(data.id, userId);
  });
}
