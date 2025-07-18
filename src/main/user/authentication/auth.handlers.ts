import { ipcMain } from "electron";
import { AuthService } from "./auth.service";
import type { IpcResponse } from "@/main/types";
import type { LoginCredentials, RegisterUserInput } from "./auth.types";

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

  // Get current authenticated user
  ipcMain.handle("auth:getCurrentUser", async (): Promise<IpcResponse> => {
    try {
      const result = await AuthService.getCurrentUser();
      return {
        success: result.valid,
        data: result.user,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get current user",
      };
    }
  });

  // Logout user
  ipcMain.handle("auth:logout", async (): Promise<IpcResponse> => {
    try {
      AuthService.logout();
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

  // Check if user is logged in
  ipcMain.handle("auth:isLoggedIn", async (): Promise<IpcResponse> => {
    try {
      const isLoggedIn = AuthService.isLoggedIn();
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
