import type {
  CreateProjectDto,
  ProjectDto,
  ProjectFilterDto,
  UpdateProjectDto,
} from "../../../../shared/types/projects/project.types";

export const projectService = {
  async list(filter?: ProjectFilterDto): Promise<ProjectDto[]> {
    return window.electronIPC.invoke("project:list", filter) as Promise<
      ProjectDto[]
    >;
  },

  async getById(id: string): Promise<ProjectDto | null> {
    return window.electronIPC.invoke("project:getById", {
      id,
    }) as Promise<ProjectDto | null>;
  },

  async create(data: CreateProjectDto): Promise<ProjectDto> {
    return window.electronIPC.invoke(
      "project:create",
      data,
    ) as Promise<ProjectDto>;
  },

  async update(data: UpdateProjectDto): Promise<ProjectDto> {
    return window.electronIPC.invoke(
      "project:update",
      data,
    ) as Promise<ProjectDto>;
  },

  async delete(id: string): Promise<void> {
    return window.electronIPC.invoke("project:delete", { id });
  },

  async archive(id: string): Promise<ProjectDto> {
    return window.electronIPC.invoke("project:archive", {
      id,
    }) as Promise<ProjectDto>;
  },
};
