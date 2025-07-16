import { ipcMain } from "electron";

import {
  createUser,
  findUserById,
  updateUserProfile,
  updateUserSettings,
  getUserPreferences,
  deleteUser,
  userEntityToDto,
  userPreferencesToDto,
  // Direct message functions
  createDirectMessage,
  getConversationMessages,
  // Conversation functions
  createConversation,
  findConversationById,
  findAllConversations,
  findOrCreateDirectMessage,
  // AI messaging functions
  processUserMessage,
} from "../domains/users/functions";

export function registerUserHandlers(): void {
  ipcMain.handle("user:create", async (_, data) => {
    const user = await createUser(data);
    return userEntityToDto(user);
  });

  ipcMain.handle("user:getById", async (_, data) => {
    const user = await findUserById(data.id);
    return user ? userEntityToDto(user) : null;
  });

  ipcMain.handle("user:updateProfile", async (_, data) => {
    await updateUserProfile(data.id, data);
  });

  ipcMain.handle("user:updateSettings", async (_, data) => {
    await updateUserSettings(data.id, data.settings);
  });

  ipcMain.handle("user:getPreferences", async (_, data) => {
    const preferences = await getUserPreferences(data.userId);
    return preferences ? userPreferencesToDto(preferences) : null;
  });

  ipcMain.handle("user:delete", async (_, data) => {
    await deleteUser(data.id);
  });
}

export function registerDirectMessageHandlers(): void {
  // Direct message handlers (direct-messages module)
  ipcMain.handle("dm:conversation:create", async (_, data) => {
    return await createConversation(data);
  });

  ipcMain.handle("dm:conversation:getById", async (_, data) => {
    return await findConversationById(data.id);
  });

  ipcMain.handle("dm:conversation:list", async (_) => {
    return await findAllConversations();
  });

  ipcMain.handle("dm:conversation:findOrCreate", async (_, data) => {
    return await findOrCreateDirectMessage(data.participants);
  });

  ipcMain.handle("dm:message:create", async (_, data) => {
    return await createDirectMessage(data);
  });

  ipcMain.handle("dm:message:listByConversation", async (_, data) => {
    const limit = data.limit || 20;
    const offset = data.offset || 0;
    return await getConversationMessages(data.conversationId, limit, offset);
  });

  ipcMain.handle("dm:ai:sendMessage", async (_, data) => {
    return await processUserMessage(
      data.conversationId,
      data.content,
      data.userId,
    );
  });

  ipcMain.handle("dm:agent:sendMessage", async (_, data) => {
    return await processUserMessage(
      data.conversationId,
      data.message,
      data.userId,
    );
  });

  ipcMain.handle("dm:agent:regenerateResponse", async (_, data) => {
    // Para regenerar, vamos pegar a última mensagem do usuário e reprocessar
    const messages = await getConversationMessages(data.conversationId, 10, 0);
    const lastUserMessage = messages
      .filter((msg) => msg.senderType === "user")
      .pop();

    if (lastUserMessage) {
      return await processUserMessage(
        data.conversationId,
        lastUserMessage.content,
        data.userId,
      );
    }

    return null;
  });
}
