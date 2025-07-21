import { ipcMain } from "electron";

import type {
  InsertProject,
  UpdateProject,
} from "@/main/features/project/project.model";
import { ProjectService } from "@/main/features/project/project.service";
import type { IpcResponse } from "@/main/types";

function setupCreateHandler(): void {
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
}

function setupFindByIdHandler(): void {
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
}

function setupListAllHandler(): void {
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
}

function setupUpdateHandler(): void {
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
}

function setupArchiveHandler(): void {
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

/**
 * Setup project IPC handlers
 * Exposes ProjectService methods to the frontend via IPC
 */
export function setupProjectHandlers(): void {
  setupCreateHandler();
  setupFindByIdHandler();
  setupListAllHandler();
  setupUpdateHandler();
  setupArchiveHandler();
}
