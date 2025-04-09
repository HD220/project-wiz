import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { historyService } from "./history-service";
import { saveToken, removeToken, hasToken } from "./github-token-manager";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

if (started) {
  app.quit();
}

/**
 * Registra os handlers IPC para o HistoryService
 */
function registerHistoryServiceHandlers() {
  ipcMain.handle("history:createConversation", async (_event, title?: string) => {
    return historyService.createConversation(title);
  });

  ipcMain.handle("history:addMessage", async (_event, conversationId: string, role: "user" | "assistant", content: string) => {
    return historyService.addMessage(conversationId, role, content);
  });

  ipcMain.handle("history:getConversations", async (_event, params?: { offset?: number; limit?: number; search?: string }) => {
    return historyService.getConversations(params);
  });

  ipcMain.handle("history:getMessages", async (_event, conversationId: string) => {
    return historyService.getMessages(conversationId);
  });

  ipcMain.handle("history:deleteConversation", async (_event, conversationId: string) => {
    return historyService.deleteConversation(conversationId);
  });

  ipcMain.handle("history:exportHistory", async (_event, format: "json" | "csv") => {
    return historyService.exportHistory(format);
  });

  ipcMain.handle("history:renameConversation", async (_event, conversationId: string, newTitle: string) => {
    return historyService.renameConversation(conversationId, newTitle);
  });
}

/**
 * Registra os handlers IPC para gerenciamento do token GitHub
 */
function registerGitHubTokenHandlers() {
  ipcMain.handle("githubToken:save", async (_event, token: string) => {
    return saveToken(token);
  });

  ipcMain.handle("githubToken:remove", async () => {
    return removeToken();
  });

  ipcMain.handle("githubToken:status", async () => {
    return hasToken();
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  registerHistoryServiceHandlers();
  registerGitHubTokenHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
