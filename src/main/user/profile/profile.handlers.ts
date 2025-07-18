import { ipcMain } from "electron";
import {
  getUserProfile,
  updateUserProfile,
  updateUserAvatar,
  updateUserPreferences,
  getUserActivityStats,
} from "./profile.service";
import { requireUserId } from "../../utils/auth-utils";

export function registerProfileHandlers(): void {
  ipcMain.handle("profile:get", async (_, data) => {
    const userId = requireUserId(data);
    return await getUserProfile(userId);
  });

  ipcMain.handle("profile:update", async (_, data) => {
    const userId = requireUserId(data);
    return await updateUserProfile(userId, data);
  });

  ipcMain.handle("profile:updateAvatar", async (_, data) => {
    const userId = requireUserId(data);
    return await updateUserAvatar(userId, data.avatarUrl);
  });

  ipcMain.handle("profile:updatePreferences", async (_, data) => {
    const userId = requireUserId(data);
    return await updateUserPreferences(userId, data.preferences);
  });

  ipcMain.handle("profile:getActivityStats", async (_, data) => {
    const userId = requireUserId(data);
    return await getUserActivityStats(userId);
  });
}
