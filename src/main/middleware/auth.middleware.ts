import { AuthService } from "@/main/features/auth/auth.service";
import type { IpcResponse } from "@/main/types";

import type { IpcMainInvokeEvent } from "electron";

/**
 * Authentication middleware for IPC handlers
 */
export function withAuth<TArgs extends any[], TReturn>(
  handler: (
    event: IpcMainInvokeEvent,
    sessionToken: string,
    ...args: TArgs
  ) => Promise<TReturn>,
) {
  return async (
    event: IpcMainInvokeEvent,
    sessionToken: string,
    ...args: TArgs
  ): Promise<IpcResponse<TReturn>> => {
    try {
      // Validate session token
      const user = await AuthService.getCurrentUser(sessionToken);

      if (!user) {
        return {
          success: false,
          error: "Authentication required",
        };
      }

      // Call the actual handler
      const result = await handler(event, sessionToken, ...args);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("session")) {
        return {
          success: false,
          error: "Invalid or expired session",
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      };
    }
  };
}

/**
 * Simplified auth middleware that just extracts user ID
 */
export function withAuthUserId<TArgs extends any[], TReturn>(
  handler: (
    event: IpcMainInvokeEvent,
    userId: string,
    ...args: TArgs
  ) => Promise<TReturn>,
) {
  return async (
    event: IpcMainInvokeEvent,
    sessionToken: string,
    ...args: TArgs
  ): Promise<IpcResponse<TReturn>> => {
    try {
      // Validate session and get user
      const user = await AuthService.getCurrentUser(sessionToken);

      if (!user) {
        return {
          success: false,
          error: "Authentication required",
        };
      }

      // Call handler with user ID
      const result = await handler(event, user.id, ...args);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("session")) {
        return {
          success: false,
          error: "Invalid or expired session",
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      };
    }
  };
}

/**
 * Auth middleware that provides full user context
 */
export function withAuthUser<TArgs extends any[], TReturn>(
  handler: (
    event: IpcMainInvokeEvent,
    user: { id: string; email: string; name: string },
    ...args: TArgs
  ) => Promise<TReturn>,
) {
  return async (
    event: IpcMainInvokeEvent,
    sessionToken: string,
    ...args: TArgs
  ): Promise<IpcResponse<TReturn>> => {
    try {
      // Validate session and get user
      const user = await AuthService.getCurrentUser(sessionToken);

      if (!user) {
        return {
          success: false,
          error: "Authentication required",
        };
      }

      // Call handler with full user object
      const result = await handler(event, user, ...args);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("session")) {
        return {
          success: false,
          error: "Invalid or expired session",
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      };
    }
  };
}
