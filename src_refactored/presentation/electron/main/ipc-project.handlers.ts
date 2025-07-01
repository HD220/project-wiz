import { ipcMain, IpcMainInvokeEvent } from "electron";

import { ListProjectsUseCase } from "@/core/application/use-cases/project/list-projects.use-case";

import { appContainer } from "@/infrastructure/ioc/inversify.config";

import { IPCChannel } from "@/shared/ipc-channels";
import { ProjectListItem } from "@/shared/ipc-project.types";

let listProjectsUseCase: ListProjectsUseCase;

function initializeUseCases() {
  if (appContainer.isBound(ListProjectsUseCase)) {
    listProjectsUseCase = appContainer.get(ListProjectsUseCase);
  } else {
    console.error(
      "[IPC Project Handler] CRITICAL: ListProjectsUseCase not bound in DI container. Cannot proceed with manual instantiation."
    );
  }
}

export function registerProjectIPCHandlers(): void {
  initializeUseCases();

  ipcMain.handle(
    IPCChannel.PROJECT_LIST_QUERY,
    async (event: IpcMainInvokeEvent) => {
      console.log(
        `[IPC Project Handler] Received ${IPCChannel.PROJECT_LIST_QUERY}`
      );
      try {
        if (!listProjectsUseCase) {
          if (!appContainer.isBound(ListProjectsUseCase)) {
            console.error(
              "[IPC Project Handler] ListProjectsUseCase is NOT BOUND on demand. Check DI config."
            );
            throw new Error(
              "ListProjectsUseCase could not be initialized - not bound in DI container."
            );
          }
          listProjectsUseCase = appContainer.get(ListProjectsUseCase);
          if (!listProjectsUseCase) {
            throw new Error(
              "ListProjectsUseCase could not be initialized even after re-check."
            );
          }
        }

        const result = await listProjectsUseCase.execute();

        if (result.isSuccess()) {
          const projects = result.value;
          const projectListItems: ProjectListItem[] = projects.map(
            (project) => ({
              id: project.id.value,
              name: project.name.value,
              description: project.description?.value,
              createdAt: project.createdAt.toISOString(),
              updatedAt: project.updatedAt.toISOString(),
              // ownerName: project.owner?.name.value, // Example, if Project entity has owner
              // thumbnailUrl: project.thumbnailUrl?.value, // Example
            })
          );
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
        return {
          success: false,
          error: {
            message:
              error.message ||
              "An unexpected error occurred while listing projects.",
          },
        };
      }
    }
  );

  console.log("[IPC Project Handler] Project IPC handlers registered.");
}

export function unregisterProjectIPCHandlers(): void {
  ipcMain.removeHandler(IPCChannel.PROJECT_LIST_QUERY);
  console.log("[IPC Project Handler] Project IPC handlers unregistered.");
}
