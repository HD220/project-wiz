// User API - IPC communication layer for user operations

import type { IpcResponse } from "@/main/types";
import type { Theme } from "@/main/features/user/user.types";

export const userApi = {
  // Profile operations
  async getTheme(userId: string): Promise<IpcResponse> {
    return window.api.profile.getTheme(userId);
  },

  async updateTheme(userId: string, theme: Theme): Promise<IpcResponse> {
    return window.api.profile.updateTheme(userId, theme);
  },

  // User operations (using auth API for now since profile handlers extend auth)
  async getCurrentUser(): Promise<IpcResponse> {
    return window.api.auth.getCurrentUser();
  },

  async getUserById(userId: string): Promise<IpcResponse> {
    return window.api.auth.getUserById(userId);
  },
};