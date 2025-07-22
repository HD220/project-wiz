import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  SelectProject,
  InsertProject,
  UpdateProject,
  ProjectFilters,
} from "@/main/features/project/project.types";

import { projectApi } from "@/renderer/features/project/project.api";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => projectApi.listAll(),
    select: (response) => {
      if (response.success && response.data) {
        return response.data as SelectProject[];
      }
      throw new Error(response.error || "Failed to load projects");
    },
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => projectApi.findById(id!),
    enabled: !!id,
    select: (response) => {
      if (response.success && response.data) {
        return response.data as SelectProject;
      }
      throw new Error(response.error || "Project not found");
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InsertProject) => projectApi.create(input),
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        queryClient.setQueryData(
          ["project", response.data.id],
          response.data as SelectProject,
        );
      } else {
        throw new Error(response.error || "Failed to create project");
      }
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProject) => projectApi.update(input),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        queryClient.setQueryData(
          ["project", variables.id],
          response.data as SelectProject,
        );
      } else {
        throw new Error(response.error || "Failed to update project");
      }
    },
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectApi.archive(id),
    onSuccess: (response, id) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        queryClient.invalidateQueries({ queryKey: ["project", id] });
      } else {
        throw new Error(response.error || "Failed to archive project");
      }
    },
  });
}

export function useFilteredProjects(filters: ProjectFilters) {
  const { data: projects = [] } = useProjects();

  const filteredProjects = projects.filter((project) => {
    if (filters.status && project.status !== filters.status) {
      return false;
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !project.name.toLowerCase().includes(searchLower) &&
        !project.description?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (filters.hasGitUrl !== undefined) {
      const hasGit = !!project.gitUrl;
      if (filters.hasGitUrl !== hasGit) {
        return false;
      }
    }

    if (filters.hasLocalPath !== undefined) {
      const hasLocal = !!project.localPath;
      if (filters.hasLocalPath !== hasLocal) {
        return false;
      }
    }

    return true;
  });

  return {
    filteredProjects,
    activeProjects: projects.filter((p) => p.status === "active"),
    archivedProjects: projects.filter((p) => p.status === "archived"),
  };
}
