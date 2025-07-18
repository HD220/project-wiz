import { ipcMain } from "electron";
import {
  login,
  register,
  validateToken,
  listAccounts,
  createDefaultAccount,
  isFirstRun,
  extractUserIdFromToken,
} from "./auth.service";

export function registerAuthHandlers(): void {
  ipcMain.handle("auth:login", async (_, data) => {
    return await login(data);
  });

  ipcMain.handle("auth:register", async (_, data) => {
    return await register(data);
  });

  ipcMain.handle("auth:validate-token", async (_, data) => {
    return await validateToken(data.token);
  });

  ipcMain.handle("auth:list-accounts", async () => {
    return await listAccounts();
  });

  ipcMain.handle("auth:create-default-account", async () => {
    return await createDefaultAccount();
  });

  ipcMain.handle("auth:is-first-run", async () => {
    return await isFirstRun();
  });

  ipcMain.handle("auth:extract-user-id", async (_, data) => {
    return extractUserIdFromToken(data.token);
  });
}
