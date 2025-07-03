import path from "path";

import { app, BrowserWindow, ipcMain } from "electron";
import squirrelStartup from "electron-squirrel-startup";

// import { registerAgentInstanceHandlers } from "./handlers/agent-instance.handlers";
// import { registerDMHandlers } from "./handlers/dm.handlers";
// import { registerLLMConfigHandlers } from "./handlers/llm-config.handlers";
// import { registerPersonaTemplateHandlers } from "./handlers/persona-template.handlers";
// import { registerProjectHandlers } from "./handlers/project.handlers";
// import { registerUserHandlers } from "./handlers/user.handlers";
// import { registerChatIPCHandlers } from "./ipc-chat.handlers";
// import { registerProjectIPCHandlers as registerLegacyProjectIPCHandlers } from "./ipc-project.handlers";

if (squirrelStartup) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "./preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(
        __dirname,
        `../renderer/${process.env.MAIN_WINDOW_VITE_NAME}/index.html`
      )
    );
  }

  if (
    process.env.NODE_ENV === "development" ||
    process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL
  ) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

app.on("ready", () => {
  console.log("[Main Process] Registering IPC Handlers...");

  // registerChatIPCHandlers();
  // registerLegacyProjectIPCHandlers();

  // registerProjectHandlers();
  // console.log("[Main Process] Project handlers registered.");
  // registerPersonaTemplateHandlers();
  // console.log("[Main Process] Persona Template handlers registered.");
  // registerAgentInstanceHandlers();
  // console.log("[Main Process] Agent Instance handlers registered.");
  // registerLLMConfigHandlers();
  // console.log("[Main Process] LLM Config handlers registered.");
  // registerUserHandlers();
  // console.log("[Main Process] User handlers registered.");
  // registerDMHandlers();
  // console.log("[Main Process] DM handlers registered.");

  // console.log("[Main Process] All IPC Handlers registered.");

  createWindow();
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
