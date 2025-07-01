import { ipcMain, IpcMainInvokeEvent } from "electron";

import { ListProjectsUseCase } from "@/core/application/use-cases/project/list-projects.use-case";

// import { appContainer } from "@/infrastructure/ioc/inversify.config"; // Removed import

import { IPCChannel } from "@/shared/ipc-channels";
import { ProjectListItem } from "@/shared/ipc-project.types";

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

  ipcMain.handle(IPCChannel.PROJECT_LIST_QUERY, handleProjectListQuery);

  console.log("[IPC Project Handler] Project IPC handlers registered.");
}

function mapProjectsToProjectListItems(projects: Project[]): ProjectListItem[] {
  return projects.map((project) => ({
    id: project.id.value,
    name: project.name.value,
    description: project.description?.value,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    // ownerName: project.owner?.name.value, // Example, if Project entity has owner
    // thumbnailUrl: project.thumbnailUrl?.value, // Example
  }));
}

async function handleProjectListQuery(_event: IpcMainInvokeEvent) {
  console.log(
    `[IPC Project Handler] Received ${IPCChannel.PROJECT_LIST_QUERY}`
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

    const result = await internalListProjectsUseCase.execute();

    if (result.isSuccess()) {
      const projects = result.value;
      const projectListItems = mapProjectsToProjectListItems(projects);
      console.log(
        `[IPC Project Handler] Sending ${projectListItems.length} projects.`
      );
      return { success: true, data: projectListItems };
    }
    console.error(
      "[IPC Project Handler] Error listing projects:",
      result.error
    );
    return {
      success: false,
      error: { message: result.error.message, name: result.error.name },
    };
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
  ipcMain.removeHandler(IPCChannel.PROJECT_LIST_QUERY);
  // Clear the reference
  internalListProjectsUseCase = null;
  console.log("[IPC Project Handler] Project IPC handlers unregistered.");
}
