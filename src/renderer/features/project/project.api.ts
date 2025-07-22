import type {
  SelectProject,
  InsertProject,
} from "@/main/features/project/project.model";
import type { IpcResponse } from "@/main/types";

export class ProjectAPI {
  static async create(input: InsertProject): Promise<SelectProject> {
    const response: IpcResponse<SelectProject> =
      await window.api.projects.create(input);

    if (!response.success) {
      throw new Error(response.error || "Failed to create project");
    }

    return response.data!;
  }

  static async findById(id: string): Promise<SelectProject | null> {
    const response: IpcResponse<SelectProject | null> =
      await window.api.projects.findById(id);

    if (!response.success) {
      throw new Error(response.error || "Failed to get project");
    }

    return response.data!;
  }

  static async listAll(): Promise<SelectProject[]> {
    const response: IpcResponse<SelectProject[]> =
      await window.api.projects.listAll();

    if (!response.success) {
      throw new Error(response.error || "Failed to list projects");
    }

    return response.data!;
  }

  static async update(
    id: string,
    input: Partial<InsertProject>,
  ): Promise<SelectProject> {
    const response: IpcResponse<SelectProject> =
      await window.api.projects.update(id, input);

    if (!response.success) {
      throw new Error(response.error || "Failed to update project");
    }

    return response.data!;
  }

  static async archive(id: string): Promise<SelectProject> {
    const response: IpcResponse<SelectProject> =
      await window.api.projects.archive(id);

    if (!response.success) {
      throw new Error(response.error || "Failed to archive project");
    }

    return response.data!;
  }

  static async delete(id: string): Promise<void> {
    const response: IpcResponse<void> = await window.api.projects.delete(id);

    if (!response.success) {
      throw new Error(response.error || "Failed to delete project");
    }
  }
}
