import { Project } from "@/core/domain/entities/project.entity";

import { IPC_CHANNELS } from "@/shared/ipc-channels.constants";
import { IPCResponse } from "@/shared/ipc-types";

export class ProjectService {
  async getProjects(): Promise<IPCResponse<Project[]>> {
    try {
      if (!window.electronIPC) {
        throw new Error("Electron IPC bridge not found.");
      }
      const response = await window.electronIPC.invoke(
        IPC_CHANNELS.GET_PROJECTS_LIST
      );
      // The main process handler now returns Project[] directly or throws an error.
      // We need to wrap it in IPCResponse here.
      return { success: true, data: response as Project[] };
    } catch (error: unknown) {
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      return { success: false, error: { message: errorMessage } };
    }
  }
}
