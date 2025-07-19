import { ipcMain } from "electron";

import type { IpcResponse } from "@/main/types";
import type { Theme } from "@/main/user/authentication/users.schema";
import { ProfileService } from "@/main/user/profile/profile.service";

export function setupProfileHandlers(): void {
  ipcMain.handle(
    "profile:getTheme",
    async (_, userId: string): Promise<IpcResponse> => {
      try {
        const result = await ProfileService.getTheme(userId);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to get theme",
        };
      }
    },
  );

  ipcMain.handle(
    "profile:updateTheme",
    async (_, userId: string, theme: Theme): Promise<IpcResponse> => {
      try {
        const result = await ProfileService.updateTheme(userId, theme);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to update theme",
        };
      }
    },
  );
}
