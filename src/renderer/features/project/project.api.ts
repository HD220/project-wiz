import type {
  SelectProject,
  InsertProject,
} from "@/main/features/project/project.types";

export class ProjectAPI {
  static async create(input: InsertProject): Promise<SelectProject> {
    const response = await window.api.projects.create(input);

    if (!response.success) {
      throw new Error(response.error || "Failed to create project");
    }

    return response.data!;
  }

  static async findById(id: string): Promise<SelectProject | null> {
    const response = await window.api.projects.findById(id);

    if (!response.success) {
      throw new Error(response.error || "Failed to get project");
    }

    return response.data || null;
  }

  static async listAll(): Promise<SelectProject[]> {
    const response = await window.api.projects.listAll();

    if (!response.success) {
      throw new Error(response.error || "Failed to list projects");
    }

    return response.data || [];
  }

  static async update(
    input: { id: string } & Partial<InsertProject>,
  ): Promise<SelectProject> {
    const response = await window.api.projects.update(input);

    if (!response.success) {
      throw new Error(response.error || "Failed to update project");
    }

    return response.data!;
  }

  static async archive(id: string): Promise<SelectProject> {
    const response = await window.api.projects.archive(id);

    if (!response.success) {
      throw new Error(response.error || "Failed to archive project");
    }

    return response.data!;
  }

  // Delete is not available in the API - use archive instead
  // static async delete(id: string): Promise<void> {
  //   Archive the project instead of deleting
  // }
}
