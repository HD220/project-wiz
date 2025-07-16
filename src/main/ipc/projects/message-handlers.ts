import { ipcMain } from "electron";

import {
  handleCreateMessage,
  handleGetMessageById,
  handleListMessagesByChannel,
  handleListMessagesByAuthor,
  handleDeleteMessage,
} from "./message-handlers/basic-handlers";
import {
  handleCreateTextMessage,
  handleCreateCodeMessage,
  handleCreateSystemMessage,
} from "./message-handlers/typed-handlers";

export function registerMessageHandlers(): void {
  ipcMain.handle("channelMessage:create", handleCreateMessage);
  ipcMain.handle("channelMessage:getById", handleGetMessageById);
  ipcMain.handle("channelMessage:listByChannel", handleListMessagesByChannel);
  ipcMain.handle("channelMessage:listByAuthor", handleListMessagesByAuthor);
  ipcMain.handle("channelMessage:delete", handleDeleteMessage);
  ipcMain.handle("channelMessage:createText", handleCreateTextMessage);
  ipcMain.handle("channelMessage:createCode", handleCreateCodeMessage);
  ipcMain.handle("channelMessage:createSystem", handleCreateSystemMessage);
}
