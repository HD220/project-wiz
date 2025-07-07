import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";


import type { Project } from "@/core/domain/entities/project.entity";

import { NoProjectsDisplay } from "@/ui/features/project/components/list/NoProjectsDisplay";
import { ProjectsFilterOptions } from "@/ui/features/project/components/list/ProjectsFilterOptions";
import { ProjectsHeader } from "@/ui/features/project/components/list/ProjectsHeader";
import { ProjectList } from "@/ui/features/project/components/ProjectList";
import { useIpcQuery } from "@/ui/hooks/ipc/use-ipc-query.hook";

import { IPC_CHANNELS } from "@/shared/ipc-channels.constants";
import type { GetProjectsListResponse } from "@/shared/ipc-types/project.types";

function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("name-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: projects, isLoading, error } = useIpcQuery<
    GetProjectsListResponse,
    undefined
  >(
    IPC_CHANNELS.GET_PROJECTS_LIST,
    undefined,
    { staleTime: 5 * 60 * 1000 },
  );

  const filteredAndSortedProjects = (projects || [])
    .filter(
      (project: Project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((projectA: Project, projectB: Project) => {
      if (sortOrder === "name-asc")
        return projectA.name.localeCompare(projectB.name);
      if (sortOrder === "name-desc")
        return projectB.name.localeCompare(projectA.name);
      return 0;
    });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <ProjectsHeader />

      <ProjectsFilterOptions
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {isLoading && <p>Carregando projetos...</p>}
      {error && <p>Erro ao carregar projetos: {error.message}</p>}

      {!isLoading && !error && filteredAndSortedProjects.length > 0 ? (
        <ProjectList projects={filteredAndSortedProjects} viewMode={viewMode} />
      ) : !isLoading && !error ? (
        <NoProjectsDisplay searchTerm={searchTerm} />
      ) : null}
    </div>
  );
}

export const Route = createFileRoute("/app/projects/")({
  component: ProjectsPage,
});

