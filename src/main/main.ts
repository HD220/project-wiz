import path from "path";

import { app, BrowserWindow, ipcMain } from "electron";
import squirrelStartup from "electron-squirrel-startup";

import { ProjectRepository } from "./modules/project-management/persistence/repository";
import { ProjectService } from "./modules/project-management/services/project.service";
import { ProjectMapper } from "./modules/project-management/mappers/project.mapper";
import { ProjectIpcHandlers } from "./modules/project-management/ipc/handlers";
import { ConversationService } from "./modules/direct-messages/services/conversation.service";
import { MessageService } from "./modules/direct-messages/services/message.service";
import { DirectMessageIpcHandlers } from "./modules/direct-messages/ipc/handlers";
import { ChannelRepository } from "./modules/communication/persistence/repository";
import { ChannelService } from "./modules/communication/application/channel.service";
import { ChannelMapper } from "./modules/communication/channel.mapper";
import { ChannelIpcHandlers } from "./modules/communication/ipc/handlers";
import { ChannelMessageRepository } from "./modules/channel-messaging/persistence/repository";
import { ChannelMessageService } from "./modules/channel-messaging/application/channel-message.service";
import { ChannelMessageMapper } from "./modules/channel-messaging/channel-message.mapper";
import { ChannelMessageIpcHandlers } from "./modules/channel-messaging/ipc/handlers";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

if (squirrelStartup) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

// Window control handlers
ipcMain.handle("window-minimize", () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle("window-maximize", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle("window-close", () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle("window-is-maximized", () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

app.on("ready", async () => {
  createWindow();

  // Initialize project management module
  const projectRepository = new ProjectRepository();
  const projectService = new ProjectService(projectRepository);
  const projectMapper = new ProjectMapper();
  const projectIpcHandlers = new ProjectIpcHandlers(projectService, projectMapper);
  
  // Initialize direct messages module
  const conversationService = new ConversationService();
  const messageService = new MessageService();
  const directMessageIpcHandlers = new DirectMessageIpcHandlers(
    conversationService,
    messageService
  );
  
  // Initialize communication module (channels)
  const channelRepository = new ChannelRepository();
  const channelMapper = new ChannelMapper();
  const channelService = new ChannelService(channelRepository, channelMapper);
  const channelIpcHandlers = new ChannelIpcHandlers(channelService, channelMapper);
  
  // Initialize channel messaging module
  const channelMessageRepository = new ChannelMessageRepository();
  const channelMessageMapper = new ChannelMessageMapper();
  const channelMessageService = new ChannelMessageService(channelMessageRepository, channelMessageMapper);
  const channelMessageIpcHandlers = new ChannelMessageIpcHandlers(channelMessageService, channelMessageMapper);
  
  projectIpcHandlers.registerHandlers();
  directMessageIpcHandlers.registerHandlers();
  channelIpcHandlers.registerHandlers();
  channelMessageIpcHandlers.registerHandlers();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("will-quit", () => {});

ipcMain.handle("app:is-dev", () => {
  return (
    process.env.NODE_ENV === "development" ||
    !!process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL
  );
});

console.log("[Main Process] Main process script loaded.");
