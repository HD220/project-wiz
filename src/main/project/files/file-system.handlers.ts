import { ipcMain } from "electron";
import { fileSystemService } from "./file-system.service";
import { getLogger } from "@/main/utils/logger";

const logger = getLogger("file-system-handlers");

export function setupFileSystemHandlers(): void {
  // Get project file system
  ipcMain.handle("fileSystem:getProjectFiles", async (_, { projectId }) => {
    try {
      logger.info(`Getting file system for project: ${projectId}`);
      const result = await fileSystemService.getProjectFileSystem(projectId);
      return { success: true, data: result };
    } catch (error) {
      logger.error("Error getting project file system:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get project files",
      };
    }
  });

  // Get file content
  ipcMain.handle("fileSystem:getFileContent", async (_, { filePath }) => {
    try {
      logger.info(`Getting file content for: ${filePath}`);
      const result = await fileSystemService.getFileContent(filePath);
      return result;
    } catch (error) {
      logger.error("Error getting file content:", error);
      return errorHandler.handleError(error, {
        context: "fileSystem:getFileContent",
        filePath,
      });
    }
  });

  logger.info("File system handlers registered");
}
