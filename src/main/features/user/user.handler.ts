import { ipcMain } from "electron";

import type { IpcResponse } from "@/main/types";
import type { UserSummary } from "@/main/features/user/user.service";
import { UserService } from "@/main/features/user/user.service";
import { AuthService } from "@/main/features/auth/auth.service";

export function setupUserHandlers(): void {
  /**
   * List available users for conversations (ownership-aware)
   * Returns my agents + other humans via UNION ALL
   */
  ipcMain.handle(
    "user:listAvailableUsers",
    async (): Promise<IpcResponse<UserSummary[]>> => {
      try {
        // Get current authenticated user
        const currentUser = await AuthService.getCurrentUser();
        if (!currentUser) {
          throw new Error("User not authenticated");
        }

        const availableUsers = await UserService.listAvailableUsers(
          currentUser.id,
        );
        return { success: true, data: availableUsers };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to list available users",
        };
      }
    },
  );
}
