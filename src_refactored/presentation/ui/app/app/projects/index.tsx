import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";

import { NoProjectsDisplay } from "@/ui/features/project/components/list/NoProjectsDisplay";
import { ProjectsFilterOptions } from "@/ui/features/project/components/list/ProjectsFilterOptions";
import { ProjectsHeader } from "@/ui/features/project/components/list/ProjectsHeader";
import { ProjectList } from "@/ui/features/project/components/ProjectList";
import { Project } from "@/ui/features/project/components/ProjectListItem";

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Projeto Phoenix",
    description:
      "Reconstrução da plataforma principal com foco em escalabilidade e IA.",
    lastActivity: "2 horas atrás",
    status: "active",
    agentCount: 5,
    taskCount: 23,
  },
  {
    id: "2",
    name: "Operação Quimera",
    description:
      "Integração de múltiplos serviços legados em uma nova arquitetura de microfrontends.",
    lastActivity: "1 dia atrás",
    status: "paused",
    agentCount: 2,
    taskCount: 8,
  },
  {
    id: "3",
    name: "Iniciativa Netuno",
    description:
      "Desenvolvimento de um novo data lake para análise preditiva de mercado.",
    lastActivity: "5 dias atrás",
    status: "planning",
    agentCount: 1,
    taskCount: 2,
  },
  {
    id: "4",
    name: "Projeto Alpha",
    description: "Um projeto de exploração de novas tecnologias de IA.",
    lastActivity: "3 horas atrás",
    status: "active",
    agentCount: 3,
    taskCount: 15,
  },
  {
    id: "5",
    name: "Legado Modernizado",
    description: "Atualização de sistema legado para novas tecnologias.",
    lastActivity: "1 semana atrás",
    status: "completed",
    agentCount: 0,
    taskCount: 50,
  },
];

function ProjectsPage() {
  const [projects] = useState<Project[]>(mockProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("name-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredAndSortedProjects = projects
    .filter(
      (project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((projectA, projectB) => {
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

      {filteredAndSortedProjects.length > 0 ? (
        <ProjectList projects={filteredAndSortedProjects} viewMode={viewMode} />
      ) : (
        <NoProjectsDisplay searchTerm={searchTerm} />
      )}
    </div>
  );
}

export const Route = createFileRoute("/app/projects/")({
  component: ProjectsPage,
});

