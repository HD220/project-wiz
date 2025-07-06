import { ipcMain, IpcMainInvokeEvent } from "electron";

import { ProjectListItem } from "@/core/application/use-cases/project/list-projects.schema";
import { ListProjectsUseCase } from "@/core/application/use-cases/project/list-projects.use-case";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import { IPCResponse } from "@/shared/ipc-types";


let internalListProjectsUseCase: ListProjectsUseCase | null = null;

// Removed initializeUseCases function

export function registerProjectIPCHandlers(
  listProjectsUseCaseInstance: ListProjectsUseCase
): void {
  if (!listProjectsUseCaseInstance) {
    console.error(
      "[IPC Project Handler] CRITICAL: Provided listProjectsUseCaseInstance is null or undefined."
    );
  }
  internalListProjectsUseCase = listProjectsUseCaseInstance;

  ipcMain.handle(IPC_CHANNELS.PROJECT_LIST_QUERY, handleProjectListQuery);

  console.log("[IPC Project Handler] Project IPC handlers registered.");
}



async function handleProjectListQuery(_event: IpcMainInvokeEvent): Promise<IPCResponse<ProjectListItem[]>> {
  console.log(
    `[IPC Project Handler] Received ${IPC_CHANNELS.PROJECT_LIST_QUERY}`
  );
  try {
    if (!internalListProjectsUseCase) {
      console.error(
        "[IPC Project Handler] ListProjectsUseCase not initialized. Ensure it's passed to registerProjectIPCHandlers."
      );
      return {
        success: false,
        error: { message: "ListProjectsUseCase not available." },
      };
    }

    const projects = await internalListProjectsUseCase.execute({});
    const projectListItems = projects;
    console.log(
      `[IPC Project Handler] Sending ${projectListItems.length} projects.`
    );
    return { success: true, data: projectListItems };
  } catch (error: unknown) {
    console.error(
      "[IPC Project Handler] Exception in project:list handler:",
      error
    );
    // Ensure error.message is accessed safely
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: {
        message:
          errorMessage ||
          "An unexpected error occurred while listing projects.",
      },
    };
  }
}

export function unregisterProjectIPCHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.PROJECT_LIST_QUERY);
  // Clear the reference
  internalListProjectsUseCase = null;
  console.log("[IPC Project Handler] Project IPC handlers unregistered.");
}
