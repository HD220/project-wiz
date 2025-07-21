// Project API - IPC communication layer for project operations

import type { IpcResponse } from "@/main/types";
import type {
  InsertProject,
  UpdateProject,
} from "@/main/features/project/project.types";

export const projectApi = {
  // Project CRUD operations
  async create(input: InsertProject): Promise<IpcResponse> {
    return window.api.projects.create(input);
  },

  async findById(id: string): Promise<IpcResponse> {
    return window.api.projects.findById(id);
  },

  async listAll(): Promise<IpcResponse> {
    return window.api.projects.listAll();
  },

  async update(input: UpdateProject): Promise<IpcResponse> {
    return window.api.projects.update(input);
  },

  async archive(id: string): Promise<IpcResponse> {
    return window.api.projects.archive(id);
  },
};