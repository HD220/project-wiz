import React from 'react';
import { toast } from 'sonner';

import { Project, ProjectListItem } from './ProjectListItem'; // Assuming Project type is exported

interface ProjectListProps {
  projects: Project[];
  viewMode: 'grid' | 'list';
}

export function ProjectList({ projects, viewMode }: ProjectListProps) {

  const handleDeleteProject = (projectId: string) => {
    // Placeholder for actual delete logic
    // e.g., call an IPC method, then refetch or update local state
    const currentProject = projects.find(project => project.id === projectId);
    toast.warning(`Exclusão do projeto "${currentProject?.name}" (simulado).`, {
      description: "Esta funcionalidade ainda não está conectada ao backend.",
    });
    // Example: setProjects(prev => prev.filter(project => project.id !== projectId));
  };

  const handleEditProject = (projectId: string) => {
    const currentProject = projects.find(project => project.id === projectId);
    toast.info(`Edição do projeto "${currentProject?.name}" (simulado).`, {
      description: "Redirecionamento para formulário de edição (a ser implementado).",
    });
    // Example: router.navigate({ to: `/projects/${projectId}/edit` });
  };

  const handleToggleProjectStatus = (projectId: string, currentStatus: Project['status']) => {
    const currentProject = projects.find(project => project.id === projectId);
    const newStatus = currentStatus === 'active' ? 'pausado' : 'ativo';
    toast.info(`Status do projeto "${currentProject?.name}" alterado para ${newStatus} (simulado).`, {
       description: "Esta funcionalidade ainda não está conectada ao backend.",
    });
    // Example: Update project status via API and refetch or update local state
  };


  if (viewMode === 'list') {
    return (
      <div className="flow-root">
        <div className="-my-2 sm:-my-4"> {/* Negative margins to align with parent padding if needed */}
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {projects.map((project) => (
              <ProjectListItem
                key={project.id}
                project={project}
                viewMode="list"
                onDelete={handleDeleteProject}
                onEdit={handleEditProject}
                onToggleStatus={handleToggleProjectStatus}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map((project) => (
        <ProjectListItem
          key={project.id}
          project={project}
          viewMode="grid"
          onDelete={handleDeleteProject}
          onEdit={handleEditProject}
          onToggleStatus={handleToggleProjectStatus}
        />
      ))}
    </div>
  );
}
