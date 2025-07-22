import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import type {
  InsertProject,
  ProjectFilters,
} from "@/main/features/project/project.types";

import { ProjectAPI } from "@/renderer/features/project/project.api";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => ProjectAPI.listAll(),
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => ProjectAPI.findById(id!),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InsertProject) => ProjectAPI.create(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.setQueryData(["project", data.id], data);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string } & Partial<InsertProject>) =>
      ProjectAPI.update(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.setQueryData(["project", data.id], data);
    },
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ProjectAPI.archive(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.setQueryData(["project", data.id], data);
    },
  });
}

// Delete project hook removed - use archive instead
// export function useDeleteProject() {
//   const queryClient = useQueryClient();
//
//   return useMutation({
//     mutationFn: (id: string) => ProjectAPI.archive(id),
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ["projects"] });
//       queryClient.setQueryData(["project", data.id], data);
//     },
//   });
// }

export function useFilteredProjects(filters: ProjectFilters) {
  const { data: projects = [] } = useProjects();

  return useMemo(() => {
    const filteredProjects = projects.filter((project) => {
      // Filter by status
      if (filters.status && project.status !== filters.status) {
        return false;
      }

      // Filter by search term (name)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (!project.name.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      // Filter by hasGitUrl
      if (filters.hasGitUrl !== undefined) {
        const hasGitUrl = !!project.gitUrl;
        if (filters.hasGitUrl !== hasGitUrl) {
          return false;
        }
      }

      // Filter by hasLocalPath
      if (filters.hasLocalPath !== undefined) {
        const hasLocalPath = !!project.localPath;
        if (filters.hasLocalPath !== hasLocalPath) {
          return false;
        }
      }

      return true;
    });

    const activeProjects = projects.filter((p) => p.status === "active");
    const archivedProjects = projects.filter((p) => p.status === "archived");

    return {
      filteredProjects,
      activeProjects,
      archivedProjects,
    };
  }, [projects, filters]);
}
