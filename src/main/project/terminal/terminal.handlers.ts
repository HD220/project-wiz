import { ipcMain } from "electron";

import { errorHandler } from "@/main/utils/error-handler";
import { logger } from "@/main/utils/logger";

import type { TerminalCommand } from "@/shared/types/projects/terminal.types";

import { terminalService } from "./terminal.service";

export function setupTerminalHandlers(): void {
  // Create terminal session
  ipcMain.handle(
    "terminal:createSession",
    async (event, { projectId, name, directory }) => {
      try {
        logger.info(`Creating terminal session for project: ${projectId}`);
        const result = await terminalService.createSession(
          projectId,
          name,
          directory,
        );
        return result;
      } catch (error) {
        logger.error("Error creating terminal session:", error);
        return errorHandler.handleError(error, {
          context: "terminal:createSession",
          projectId,
          name,
          directory,
        });
      }
    },
  );

  // Get terminal session
  ipcMain.handle("terminal:getSession", async (event, { sessionId }) => {
    try {
      logger.info(`Getting terminal session: ${sessionId}`);
      const result = await terminalService.getSession(sessionId);
      return result;
    } catch (error) {
      logger.error("Error getting terminal session:", error);
      return errorHandler.handleError(error, {
        context: "terminal:getSession",
        sessionId,
      });
    }
  });

  // Get project terminal sessions
  ipcMain.handle(
    "terminal:getProjectSessions",
    async (event, { projectId }) => {
      try {
        logger.info(`Getting terminal sessions for project: ${projectId}`);
        const result = await terminalService.getProjectSessions(projectId);
        return result;
      } catch (error) {
        logger.error("Error getting project terminal sessions:", error);
        return errorHandler.handleError(error, {
          context: "terminal:getProjectSessions",
          projectId,
        });
      }
    },
  );

  // Execute terminal command
  ipcMain.handle(
    "terminal:executeCommand",
    async (
      event,
      { sessionId, command }: { sessionId: string; command: TerminalCommand },
    ) => {
      try {
        logger.info(
          `Executing command in session ${sessionId}: ${command.command}`,
        );
        const result = await terminalService.executeCommand(sessionId, command);
        return result;
      } catch (error) {
        logger.error("Error executing terminal command:", error);
        return errorHandler.handleError(error, {
          context: "terminal:executeCommand",
          sessionId,
          command: command.command,
        });
      }
    },
  );

  // Close terminal session
  ipcMain.handle("terminal:closeSession", async (event, { sessionId }) => {
    try {
      logger.info(`Closing terminal session: ${sessionId}`);
      await terminalService.closeSession(sessionId);
      return { success: true };
    } catch (error) {
      logger.error("Error closing terminal session:", error);
      return errorHandler.handleError(error, {
        context: "terminal:closeSession",
        sessionId,
      });
    }
  });

  // Clear terminal session
  ipcMain.handle("terminal:clearSession", async (event, { sessionId }) => {
    try {
      logger.info(`Clearing terminal session: ${sessionId}`);
      await terminalService.clearSession(sessionId);
      return { success: true };
    } catch (error) {
      logger.error("Error clearing terminal session:", error);
      return errorHandler.handleError(error, {
        context: "terminal:clearSession",
        sessionId,
      });
    }
  });

  // Get default terminal sessions
  ipcMain.handle("terminal:getDefaultSessions", async (event) => {
    try {
      logger.info("Getting default terminal sessions");
      const result = await terminalService.getDefaultSessions();
      return result;
    } catch (error) {
      logger.error("Error getting default terminal sessions:", error);
      return errorHandler.handleError(error, {
        context: "terminal:getDefaultSessions",
      });
    }
  });

  logger.info("Terminal handlers registered");
}
