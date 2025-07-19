import { ipcMain } from "electron";
import { ProjectService } from "@/main/project/project.service";
import type { IpcResponse } from "@/main/types";
import type {
  InsertProject,
  UpdateProject,
} from "@/main/project/projects.schema";

/**
 * Setup project IPC handlers
 * Exposes ProjectService methods to the frontend via IPC
 */
export function setupProjectHandlers(): void {
  // Create project
  ipcMain.handle(
    "projects:create",
    async (_, input: InsertProject): Promise<IpcResponse> => {
      try {
        const result = await ProjectService.create(input);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to create project",
        };
      }
    },
  );

  // Find project by ID
  ipcMain.handle(
    "projects:findById",
    async (_, id: string): Promise<IpcResponse> => {
      try {
        const project = await ProjectService.findById(id);
        return {
          success: true,
          data: project,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to find project",
        };
      }
    },
  );

  // List all projects
  ipcMain.handle("projects:listAll", async (): Promise<IpcResponse> => {
    try {
      const projects = await ProjectService.listAll();
      return {
        success: true,
        data: projects,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to list projects",
      };
    }
  });

  // Update project
  ipcMain.handle(
    "projects:update",
    async (_, input: UpdateProject): Promise<IpcResponse> => {
      try {
        const result = await ProjectService.update(input);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to update project",
        };
      }
    },
  );

  // Archive project
  ipcMain.handle(
    "projects:archive",
    async (_, id: string): Promise<IpcResponse> => {
      try {
        const result = await ProjectService.archive(id);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to archive project",
        };
      }
    },
  );
}
