import { ipcMain } from "electron";

import { AuthService } from "@/main/features/auth/auth.service";
import type {
  LoginCredentials,
  RegisterUserInput,
} from "@/main/features/auth/auth.types";
import type { IpcResponse } from "@/main/types";

/**
 * Setup authentication IPC handlers
 * Exposes AuthService methods to the frontend via IPC
 */
export function setupAuthHandlers(): void {
  // Register user
  ipcMain.handle(
    "auth:register",
    async (_, input: RegisterUserInput): Promise<IpcResponse> => {
      try {
        const result = await AuthService.register(input);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Registration failed",
        };
      }
    },
  );

  // Login user
  ipcMain.handle(
    "auth:login",
    async (_, credentials: LoginCredentials): Promise<IpcResponse> => {
      try {
        const result = await AuthService.login(credentials);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Login failed",
        };
      }
    },
  );

  // Get current authenticated user (desktop - no session token needed)
  ipcMain.handle("auth:getCurrentUser", async (): Promise<IpcResponse> => {
    try {
      const user = AuthService.getCurrentUserDesktop();
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get current user",
      };
    }
  });

  // Logout user (desktop - no session token needed)
  ipcMain.handle("auth:logout", async (): Promise<IpcResponse> => {
    try {
      await AuthService.logoutDesktop();
      return {
        success: true,
        data: { message: "Logged out successfully" },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Logout failed",
      };
    }
  });

  // Check if user is logged in (desktop - no session token needed)
  ipcMain.handle("auth:isLoggedIn", async (): Promise<IpcResponse> => {
    try {
      const isLoggedIn = AuthService.isLoggedInDesktop();
      return {
        success: true,
        data: { isLoggedIn },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check login status",
      };
    }
  });

  // Get active session (desktop app - returns only user data)
  ipcMain.handle("auth:getActiveSession", async (): Promise<IpcResponse> => {
    try {
      // Initialize session from database if not already loaded
      await AuthService.initializeSession();

      const user = AuthService.getCurrentUserDesktop();
      return {
        success: true,
        data: user ? { user } : null,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get active session",
      };
    }
  });

  // Get user by ID
  ipcMain.handle(
    "auth:getUserById",
    async (_, userId: string): Promise<IpcResponse> => {
      try {
        const user = await AuthService.getUserById(userId);
        return {
          success: true,
          data: user,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to get user",
        };
      }
    },
  );
}
