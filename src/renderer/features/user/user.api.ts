// User API - IPC communication layer for user operations

import type { AuthResult } from "@/main/features/auth/auth.types";
import type { Theme } from "@/main/features/user/user.types";
import type { IpcResponse } from "@/main/types";

export const userApi = {
  // Profile operations
  async getTheme(userId: string): Promise<IpcResponse> {
    return window.api.profile.getTheme(userId);
  },

  async updateTheme(userId: string, theme: Theme): Promise<IpcResponse> {
    return window.api.profile.updateTheme(userId, theme);
  },

  // User operations (using auth API for now since profile handlers extend auth)
  async getCurrentUser(sessionToken?: string): Promise<IpcResponse> {
    if (!sessionToken) {
      // Get session from main process instead of localStorage
      const activeSession = await window.api.auth.getActiveSession();
      if (!activeSession.success || !activeSession.data) {
        return { success: false, error: "No active session" };
      }
      const authResult = activeSession.data as AuthResult;
      sessionToken = authResult.sessionToken;
    }
    return window.api.auth.getCurrentUser(sessionToken!);
  },

  async getUserById(userId: string): Promise<IpcResponse> {
    return window.api.auth.getUserById(userId);
  },
};
