import { ipcMain } from "electron";

import {
  handleCreateConversation,
  handleGetConversationById,
  handleListConversations,
  handleFindOrCreateConversation,
  handleCreateDirectMessage,
  handleListConversationMessages,
  handleSendAIMessage,
  handleSendAgentMessage,
  handleRegenerateResponse,
} from "./users/dm-handlers";
import {
  handleCreateUser,
  handleGetUserById,
  handleUpdateUserProfile,
  handleUpdateUserSettings,
  handleGetUserPreferences,
  handleDeleteUser,
} from "./users/user-handlers";

export function registerUserHandlers(): void {
  ipcMain.handle("user:create", handleCreateUser);
  ipcMain.handle("user:getById", handleGetUserById);
  ipcMain.handle("user:updateProfile", handleUpdateUserProfile);
  ipcMain.handle("user:updateSettings", handleUpdateUserSettings);
  ipcMain.handle("user:getPreferences", handleGetUserPreferences);
  ipcMain.handle("user:delete", handleDeleteUser);
}

export function registerDirectMessageHandlers(): void {
  ipcMain.handle("dm:conversation:create", handleCreateConversation);
  ipcMain.handle("dm:conversation:getById", handleGetConversationById);
  ipcMain.handle("dm:conversation:list", handleListConversations);
  ipcMain.handle(
    "dm:conversation:findOrCreate",
    handleFindOrCreateConversation,
  );
  ipcMain.handle("dm:message:create", handleCreateDirectMessage);
  ipcMain.handle(
    "dm:message:listByConversation",
    handleListConversationMessages,
  );
  ipcMain.handle("dm:ai:sendMessage", handleSendAIMessage);
  ipcMain.handle("dm:agent:sendMessage", handleSendAgentMessage);
  ipcMain.handle("dm:agent:regenerateResponse", handleRegenerateResponse);
}
