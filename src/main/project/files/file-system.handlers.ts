import { ipcMain } from "electron";
import { fileSystemService } from "./file-system.service";
import { logger } from "@/main/utils/logger";
import { errorHandler } from "@/main/utils/error-handler";

export function setupFileSystemHandlers(): void {
  // Get project file system
  ipcMain.handle("fileSystem:getProjectFiles", async (event, { projectId }) => {
    try {
      logger.info(`Getting file system for project: ${projectId}`);
      const result = await fileSystemService.getProjectFileSystem(projectId);
      return result;
    } catch (error) {
      logger.error("Error getting project file system:", error);
      return errorHandler.handleError(error, {
        context: "fileSystem:getProjectFiles",
        projectId,
      });
    }
  });

  // Get file content
  ipcMain.handle("fileSystem:getFileContent", async (event, { filePath }) => {
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
